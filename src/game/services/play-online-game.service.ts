import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Socket } from "socket.io";
import { GameState } from "../enum";
import {
  CompetitionGame,
  GamePart,
  GameRound,
  PlayerGameRegistration,
} from "../models";
import { CompetitionGameService } from "./competition-game.service";
import { JoinGameDTO, PlayGameDTO } from "../dtos";
import { ObjectId } from "mongoose";
import { PlayerGameRegistrationService } from "./player-game-registration.service";
import { GamePartService } from "./game-part.service";
import { UtilsFunc } from "src/shared/utils/utils.func";
import { GameRoundService } from "./game-round.service";
import { GameLevelService, WordGameLevelService } from "src/gamelevel/services";
import { GameLevel, WordGameLevel } from "src/gamelevel/models";
import { UsersService } from "src/user/services";
import { GameBroadcastGatewayService } from "./game-broadcast-gateway.service";

@Injectable()
export class PlayOnlineGameService {
  games: Map<
    ObjectId,
    {
      competition: CompetitionGame;
      players: {
        player: PlayerGameRegistration;
        client: Socket;
      }[];
      // gameParts:Map<ObjectId,GamePart>,
      gameRound: GameRound;
      currentGamePartID: ObjectId;
      currentPlayerIndex: number;
      currentWordGameLevel: WordGameLevel;
      playingPlayID?: string;
      gameGlobalState: GameState;
      countdownValue?: number;
      countdownInterval?: NodeJS.Timeout;
    }
  > = new Map();

  constructor(
    private gameCompetitionService: CompetitionGameService,
    private playerGameRegistration: PlayerGameRegistrationService,
    private gamePartService: GamePartService,
    private gameRoundService: GameRoundService,
    private gameLevelService: GameLevelService,
    private wordGameLevelService: WordGameLevelService,
    private gameBroadcastGatewayService: GameBroadcastGatewayService,
    private userService: UsersService
  ) {}

  async joinGame(joinGame: JoinGameDTO, client: Socket) {
    let gameObject = null;
    const game = await this.gameCompetitionService.findOneByField({
      _id: joinGame.competitionID,
    });
    if (!this.games.has(joinGame.competitionID)) {
      const gameParts: Map<string, GamePart> = new Map<string, GamePart>();
      (
        await this.gamePartService.getListOfPartOfCompetition(
          joinGame.competitionID
        )
      ).forEach((gamePart) => gameParts.set(gamePart.id, gamePart));
      gameObject = {
        competition: game,
        players: [],
        gameParts,
        currentGamePartID: null,
        currentPlayerIndex: -1,
        gameRound: null,
        currentWordGameLevel: null,
        gameGlobalState: GameState.WAITING_PLAYER,
      };
      this.games.set(game.id, gameObject);
    } else {
      gameObject = this.games.get(joinGame.competitionID);
    }
    // console.log('Game round playing and step', gameObject.competition, runningPart)
    const player: PlayerGameRegistration = gameObject.players.find(
      (gamePlayer) => joinGame.playerID == gamePlayer.player._id.toString()
    );
    if (!player) {
      const subscriber = await this.playerGameRegistration.getPlayerSubscriber(
        joinGame.playerID,
        joinGame.competitionID
      );

      const runningPart = game.gameParts.find((p) => p.gameState === GameState.RUNNING);
      const late: boolean = runningPart && gameObject.competition.gameRound?.step > 1;
      if (!subscriber)
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: "GameLocationNotFound/GameCompetition-joingame",
          message: `Unable to subscribe in this location`,
        });
      //Sauvegarde du nouveau joueur dans la liste des joueurs
      else if (!subscriber.hasLostGame && subscriber.lifeGame > 0 && !late) {
        gameObject.players.push({ ...subscriber.toObject(), client });
        this.gameBroadcastGatewayService.broadcastMessage("new-player", {
          user: await this.userService.findByField({ _id: joinGame.playerID }),
          timeLeft: gameObject.countdownValue ?? 0,
        });
      }
    }

    //Si on a atteint le nombre minimum de joueur
    if (
      gameObject.players.length >= game.minOfPlayers &&
      gameObject.players.length >= game.playerGameRegistrations.length
    ) {
      // gameObject.currentPlayerIndex = 0;
      //on notifie tous les joueurs que la partie a débuté
      const part = game.gameParts.find(
        (p) =>
          p.gameState === GameState.WAITING_PLAYER ||
          p.gameState === GameState.RUNNING
      );
      if (!part)
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: "NoPartFound/GameCompetition-joingame",
          message: `No game part found in the competition`,
        });
      this.gamePartService.update(
        { _id: part._id },
        { gameState: GameState.RUNNING }
      );
      this.gameBroadcastGatewayService.broadcastMessage("game-statechange", {
        gameState: GameState.RUNNING,
        competitionID: game._id.toString(),
        gamePart: part,
      });
      game.gameState = GameState.RUNNING;
      game.save();
      //On lance le jeu au premier joueur
      await this.startCountdown(gameObject);
    }

    //notification du nouveau joueur de l'état du jeu
    return this.getListOfPlayerRegistration();
  }

  async leaveGame(joinGame: JoinGameDTO) {
    const gameObject = this.games.get(joinGame.competitionID);
    gameObject.players = gameObject?.players.filter(
      (player) => player.player._id.toString() !== joinGame.playerID
    );
    // UtilsFunc.emitMessage(
    //   "join-game",
    //   this.getListOfPlayerRegistration(),
    //   this.getListOfClients()
    // );
    this.gameBroadcastGatewayService.broadcastMessage(
      "join-game",
      this.getListOfPlayerRegistration()
    );
    return { playerID: joinGame.playerID };
  }

  getListOfClients(): Socket[] {
    return Array.from(this.games.values())
      .map((game) => game.players.map((player) => player.client))
      .reduce((prev, curr) => [...prev, ...curr], []);
  }

  getListOfPlayerRegistration() {
    return Array.from(this.games.values()).flatMap((g) => {
      return g.players.map((client: any) => {
        return {
          player: { ...client.player, lifeGame: client.lifeGame },
          competition: g.competition,
        };
      });
    });
  }

  async changeState(
    competitionID: ObjectId,
    gamePartID: ObjectId,
    gameState: string
  ) {
    const gamePart = await this.gamePartService.findOneByField({
      _id: gamePartID,
    });
    if (!gamePart)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: "NotFound/GamePart",
        message: `Game part not found`,
      });

    const game = await this.gameCompetitionService.findOneByField({
      _id: competitionID,
    });

    if (game.gameState != GameState.RUNNING)
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: "Forbidden/GameCompetition-joingame",
        message: `The state of the competition must be in "In Progress" state for the competition to start`,
      });

    // Vérifier l'état du jeu uniquement si la compétition est RUNNING
    if (
      game.gameParts.some(
        (part) =>
          (gameState === GameState.WAITING_PLAYER &&
            (part.gameState === GameState.WAITING_PLAYER ||
              part.gameState === GameState.RUNNING)) ||
          (gameState === GameState.RUNNING &&
            part.gameState === GameState.RUNNING)
      )
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: "Forbidden/GameCompetition-running",
        message: `You cannot start multiple games of the same competition simultaneously`,
      });

    // gamePart.gameState = gameState;
    // gamePart.startDate = new Date();
    await this.gamePartService.update(
      { _id: gamePart._id },
      { gameState: gameState, startDate: gamePart.startDate }
    );

    if (gameState === GameState.WAITING_PLAYER)
      await this.initGame(competitionID, gamePartID);

    this.gameBroadcastGatewayService.broadcastMessage("game-statechange", {
      gameState: gameState,
      competitionID: game._id.toString(),
      partID: gamePartID,
    });

    const gameObject = this.games.get(competitionID);
    if (gameState === GameState.RUNNING && gameObject) {
      console.log(`Initializing on ${gameObject.competition.maxTimeToPlay}s`);
      setTimeout(async () => {
        await this.startCountdown(gameObject, gamePartID);
      }, gameObject.competition.maxTimeToPlay * 1000);
    }
    // await this.startCountdown(gameObject, gamePartID)
    if (gameState === GameState.END) await this.stopCountdown(gameObject);

    return { gameState: gameState, gameId: gamePart._id };
  }

  async initGame(competitionID: ObjectId, currentPartId: ObjectId) {
    const game = await this.gameCompetitionService.findOneByField({
      _id: competitionID,
    });
    const gameParts: Map<string, GamePart> = new Map<string, GamePart>();
    (
      await this.gamePartService.getListOfPartOfCompetition(competitionID)
    ).forEach((gamePart) => gameParts.set(gamePart.id, gamePart));
    const gameObject = {
      competition: game,
      players: [],
      gameParts,
      currentGamePartID: currentPartId,
      currentPlayerIndex: -1,
      gameRound: null,
      currentWordGameLevel: null,
      gameGlobalState: GameState.WAITING_PLAYER,
    };
    this.games.set(competitionID, gameObject);
  }
  async endPart(gamePartID: any, competitionID: ObjectId) {
    //On termine la partie
    let gamePart = await this.gamePartService.findOneByField({
      _id: gamePartID.toString(),
    });
    if (!gamePart)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: "NotFound/GamePart",
        message: [`Game part not found`],
      });

    gamePart.gameState = GameState.END;
    gamePart.endDate = new Date();
    await gamePart.save();
    const game = this.games.get(competitionID);
    await this.stopCountdown(game);
    // const foundGamePart = game.competition.gameParts.get(gamePartID);
    // foundGamePart.gameState=GameState.END;
    // foundGamePart.startDate=gamePart.startDate;
    this.gameBroadcastGatewayService.broadcastMessage("game-statechange", {
      gameState: GameState.END,
      competitionID: game.competition._id.toString(),
      partID: gamePartID,
    });

    return { gameState: GameState.END };
  }

  async getNexPlayerWithWordAndLevel(
    competitionID,
    PartID = null,
    timeOver = false
  ) {
    const competition = this.games.get(competitionID);
    if (competition.players.length > 0) {
      if (!competition.currentGamePartID) {
        competition.currentGamePartID = PartID;
      }
      if (!competition.gameRound)
        competition.gameRound = this.gameRoundService.createInstance({
          step: 0,
          gameLevel: competition.competition.gameLevel,
        });
      if (timeOver && competition.players.length > 0) {
        this.setPlayerLives(competition);
      }
      const realCompetition = await this.gameCompetitionService.findOneByField({
        _id: competitionID,
      });
      const partGame = realCompetition.gameParts.find(
        (p) => p.gameState === GameState.RUNNING
      );
      if (
        competition.players.length > 0 &&
        competition.gameRound.step <= partGame.numberOfWord
      ) {
        const gameRound = competition.gameRound;
        competition.currentPlayerIndex =
          (competition.currentPlayerIndex + 1) % competition.players.length;

        //Si c'est le dernier joueur du round
        console.log("Current player index", competition.currentPlayerIndex);
        if (competition.currentPlayerIndex == competition.players.length - 1) {
          //on a terminer ce round
          //si c'est le dernier round On termine la partie
          // const gamePart = PartID
          //   ? await this.gamePartService.findOneByField({
          //       _id: PartID.toString(),
          //     })
          //   : null;
          // if (gamePart?.gameRound.length - 1 == gameRound.step) return -1;
          // else {
          //si c'est pas le dernier Round alors on démarre un nouveau
          const newGameRound = this.gameRoundService.createInstance({
            step: gameRound.step + 1,
            gameLevel: gameRound.gameLevel,
          });
          newGameRound.gameLevel = await this.processNewGameLevel(
            competitionID,
            newGameRound.id,
            newGameRound
          );
          await newGameRound.save();
          competition.gameRound = newGameRound;
          // }
        }
        //on obtien un nouveau mot
        const wordGameLevelID = this.processNewWord(
          competition.gameRound.gameLevel
        );
        competition.currentWordGameLevel = wordGameLevelID;
        const wordGameLevel = await this.wordGameLevelService.findOneByField({
          _id: wordGameLevelID,
        });
        console.log(
          `Round ${competition.gameRound.step} curent player index ${competition.currentPlayerIndex}`
        );
        return competition.players[competition.currentPlayerIndex]
          ? {
              gameRound,
              gameWord: wordGameLevel,
              player:
                competition.players[competition.currentPlayerIndex].player._id,
              gameRoundStep: competition.gameRound.step,
            }
          : -1;
      } else return -1;
    } else {
      return -1;
    }
  }

  //On détecte le niveau du jeu
  async processNewGameLevel(competitionID, gamePartID, gameRound: GameRound) {
    let competition = this.games.get(competitionID);
    let gamePart = this.games
      .get(competitionID)
      .competition.gameParts.find((p) => p._id === gamePartID.toString());
    if (
      competition.competition.isSinglePart &&
      gameRound.step % 2 == 0 &&
      gameRound.step == 0
    ) {
      let newGameLevel = await this.gameLevelService.findOneByField({
        level: gameRound.gameLevel.level + 1,
      });
      if (newGameLevel) return newGameLevel;
    }
    return gameRound.gameLevel;
  }

  processNewWord(gameLevel: GameLevel): WordGameLevel {
    //on option le prochain mot par Random sur la liste du mot en fonction du niveau du jeu
    return gameLevel.words[
      Math.floor(
        (Math.random() * gameLevel.words.length * 100) % gameLevel.words.length
      )
    ];
  }

  async gamePlay(playGameDTO: PlayGameDTO) {
    //On vérifie que le mot de l'utilisateur est juste
    const competition = this.games.get(playGameDTO.competitionID);
    const expectedWord = await this.wordGameLevelService.findOneByField({
      _id: competition.currentWordGameLevel.toString(),
    });
    const currentPlayerID =
      competition.players[competition.currentPlayerIndex].player._id;
    //Verifier si la reponse est acceptable en verifiant si cle delais de reponse n'est pas depasse
    if (
      currentPlayerID.toString() == playGameDTO.playerID &&
      competition.gameRound.step == playGameDTO.gameRoundStep &&
      competition.currentGamePartID.toString() == playGameDTO.gamePartID
    ) {
      if (
        UtilsFunc.purgeString(expectedWord.name) !=
        UtilsFunc.purgeString(playGameDTO.word)
      ) {
        await this.setPlayerLives(competition);
      }
      // else save as won word
    }
    // le prochain joueur prend le relais
    const newPlayerInfos = await this.sendNextItem(competition);

    //on passe au joueur suivant
    return newPlayerInfos;
  }

  async setPlayerLives(competition: any) {
    //le mot n'est pas correctement écrit
    //on doit: diminuer le nombre de vie du joueur et informer tout le monde, s'il n'a plus de vie on le rétire
    //On diminue le nombre de vie du joeur
    const subscriber =
      competition.players[competition.currentPlayerIndex].player._id;
    const player = await this.playerGameRegistration.getPlayerSubscriber(
      subscriber.toString(),
      competition.competition._id.toString()
    );
    player.lifeGame = player.lifeGame > 0 ? player.lifeGame - 1 : 0;

    //s'il n'a plus de vie, on informe tous les autres joueurs
    if (player.lifeGame == 0) {
      player.hasLostGame = true;
      //on supprime le joueur en cours
      competition.players.splice(competition.currentPlayerIndex, 1);
      if (competition.currentPlayerIndex > 0) competition.currentPlayerIndex--;
    }
    await player.save();
    this.gameBroadcastGatewayService.broadcastMessage("game-player-lifegame", {
      competitionID: competition.competition._id.toString(),
      player: subscriber.toString(),
      lifeGame: player.lifeGame,
    });
  }

  // Démarre le compte à rebours
  async startCountdown(competition: any, PartID = null, init = true) {
    await this.stopCountdown(competition);
    if (init) await this.sendNextItem(competition, PartID);
    competition.countdownInterval = setInterval(async () => {
      competition.countdownValue--;
      console.log("counter ", competition.countdownValue);
      if (competition.countdownValue <= 0) {
        await this.stopCountdown(competition);
        this.resetCountdown(competition);
        if ((await this.sendNextItem(competition, PartID, true)) != -1)
          this.startCountdown(competition, PartID, false);
      }
    }, 1000); // Intervalle d'une seconde
  }

  // Envoie l'élément suivant de la liste
  async sendNextItem(competition: any, PartID = null, timeOver = false) {
    this.resetCountdown(competition);
    const playingData = await this.getNexPlayerWithWordAndLevel(
      competition.competition._id.toString(),
      PartID,
      timeOver
    );
    this.gameBroadcastGatewayService.broadcastMessage("game-play", playingData);
    // Arreter la partie si le jouer a perdu et qu'il n'y en a pas de prochain dans la liste
    if (playingData == -1)
      await this.endPart(
        competition.currentGamePartID.toString(),
        competition.competition._id.toString()
      );
    return playingData;
  }

  // Réinitialiser le compte à rebours à 10 secondes
  resetCountdown(competition: any) {
    competition.countdownValue = competition.competition.maxTimeToPlay;
  }

  // Arrêter le compte à rebours si nécessaire
  private stopCountdown(competition: any) {
    if (competition.countdownInterval) {
      clearInterval(competition.countdownInterval);
    }
  }
}
