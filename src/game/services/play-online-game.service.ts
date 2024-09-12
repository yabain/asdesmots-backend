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
    const player: PlayerGameRegistration = gameObject.players.find(
      (gamePlayer) => joinGame.playerID == gamePlayer.player._id.toString()
    );
    if (!player) {
      const subscriber = await this.playerGameRegistration.getPlayerSubscriber(
        joinGame.playerID,
        joinGame.competitionID
      );
      if (!subscriber)
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: "GameLocationNotFound/GameCompetition-joingame",
          message: `Unable to subscribe in this location`,
        });

      //Sauvegarde du nouveau joueur dans la liste des joueurs
      gameObject.players.push({ ...subscriber.toObject(), client });
      //notification de tous les précédents joueur du nouveau arrivant
      UtilsFunc.emitMessage(
        "new-player",
        {
          user: await this.userService.findByField({ _id: joinGame.playerID }),
          timeLeft: gameObject.countdownValue ?? 0,
        },
        this.getListOfClients()
      );
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

  async startPart(competitionID: ObjectId, gamePartID: ObjectId) {
    let gamePart = await this.gamePartService.findOneByField({
      _id: gamePartID,
    });
    if (!gamePart)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: "NotFound/GamePart",
        message: `Game part not found`,
      });

    let game = await this.gameCompetitionService.findOneByField({
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
      game.gameParts.some((part) => part.gameState === GameState.WAITING_PLAYER)
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: "Forbidden/GameCompetition-running",
        message: `You cannot start multiple games of the same competition simultaneously`,
      });

    if (gamePart.gameState === GameState.WAITING_PLAYER)
      return { gameState: GameState.WAITING_PLAYER };

    gamePart.gameState = GameState.WAITING_PLAYER;
    gamePart.startDate = new Date();
    await this.gamePartService.update(
      { _id: gamePart._id },
      { gameState: GameState.WAITING_PLAYER, startDate: gamePart.startDate }
    );

    let gameObject = {
      competition: game,
      players: [],
      gameParts: new Map<ObjectId, GamePart>(),
      currentGamePartID: null,
      currentPlayerIndex: -1,
      gameRound: null,
      currentWordGameLevel: null,
      gameGlobalState: GameState.WAITING_PLAYER,
    };
    this.games.set(game.id, gameObject);

    this.gameBroadcastGatewayService.broadcastMessage("game-statechange", {
      gameState: GameState.RUNNING,
      competitionID: game._id.toString(),
      partID: gamePartID,
    });
    return { gameState: GameState.WAITING_PLAYER, gameId: gamePart._id };
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
    //ici on doit selectionner le prochain joeur, a jouer, le prochain mot en fonction du type de compétition
    //et du niveau du mot
    //Selection du prochain joueur
    // le prochain joueur prend le relais
    const competition = this.games.get(competitionID);
    if (competition.players.length > 0) {
      if (!competition.currentGamePartID) {
        competition.currentGamePartID = PartID;
      }
      if (!competition.gameRound)
        competition.gameRound = this.gameRoundService.createInstance({
          step: 1,
          gameLevel: competition.competition.gameLevel,
        });
      if (timeOver && competition.players.length > 0) {
        this.setPlayerLives(competition);
      }
      if (competition.players.length > 0) {
        let gameRound = competition.gameRound;
        competition.currentPlayerIndex =
          (competition.currentPlayerIndex + 1) % competition.players.length;

        //Si c'est le dernier joueur du round
        if (competition.currentPlayerIndex == competition.players.length - 1) {
          //on a terminer ce round

          //si c'est le dernier round On termine la partie

          const gamePart = PartID
            ? await this.gamePartService.findOneByField({
                _id: PartID.toString(),
              })
            : null;
          if (gamePart?.gameRound.length - 1 == gameRound.step) return -1;
          else {
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
          }
        }

        //on obtien un nouveau mot
        const wordGameLevelID = this.processNewWord(competition.gameRound.gameLevel);
        competition.currentWordGameLevel = wordGameLevelID;
        const wordGameLevel = await this.wordGameLevelService.findOneByField({
          _id: wordGameLevelID,
        });
        console.log(
          `Round ${competition.gameRound.step} curent player index ${competition.currentPlayerIndex}`
        );
        return competition.players[competition.currentPlayerIndex] ? {
          gameRound,
          gameWord: wordGameLevel,
          player:
            competition.players[competition.currentPlayerIndex].player._id,
        } : -1;
      }
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
    const newPlayerInfos = await this.getNexPlayerWithWordAndLevel(
      playGameDTO.competitionID.toString()
    );
    const subscriber =
      competition.players[competition.currentPlayerIndex].player._id;
    const player = await this.playerGameRegistration.getPlayerSubscriber(
      subscriber.toString(),
      playGameDTO.competitionID
    );
    console.log(`expected word',${expectedWord.name} vs ${playGameDTO.word}`);
    if (
      UtilsFunc.purgeString(expectedWord.name) !=
      UtilsFunc.purgeString(playGameDTO.word)
    ) {
      //le mot n'est pas correctement écrit
      //on doit: diminuer le nombre de vie du joueur et informer tout le monde, s'il n'a plus de vie on le rétire
      //On diminue le nombre de vie du joeur
      await this.setPlayerLives(competition);
    }
    // le prochain joueur prend le relais
    if (newPlayerInfos != -1) {
      UtilsFunc.emitMessage(
        "game-play",
        newPlayerInfos,
        this.getListOfClients()
      );
    }
    // Arreter la partie si le jouer a perdu et qu'il n'y en a pas de prochain dans la liste
    else if (newPlayerInfos == -1 && player.hasLostGame)
      await this.endPart(
        competition.currentGamePartID.toString(),
        competition.competition._id.toString()
      );

    //on passe au joueur suivant
    return newPlayerInfos;
  }

  async setPlayerLives(competition: any) {
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
      competition.currentPlayerIndex --;
    }
    this.gameBroadcastGatewayService.broadcastMessage("game-player-lifegame", {
      competitionID: competition.competition._id.toString(),
      player: subscriber.toString(),
      lifeGame: player.lifeGame,
    });
    await player.save();
  }

  // Démarre le compte à rebours
  async startCountdown(competition: any, PartID = null, init = true) {
    competition.countdownValue = competition.competition.maxTimeToPlay;
    if (init) await this.sendNextItem(competition, PartID);
    competition.countdownInterval = setInterval(async () => {
      competition.countdownValue--;
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
    const playingData = await this.getNexPlayerWithWordAndLevel(
      competition.competition._id.toString(),
      PartID,
      timeOver
    );
    UtilsFunc.emitMessage("game-play", playingData, this.getListOfClients());
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
