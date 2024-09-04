import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { DataBaseService } from 'src/shared/services/database';
import { UsersService } from 'src/user/services';
import { PlayerSubscriptionDTO, PlayerUnSubscriptionDTO } from '../dtos';
import {
  CompetitionGame,
  PlayerGameRegistration,
  PlayerGameRegistrationDocument,
} from '../models';
import { GameArcardeService } from './game-arcarde.service';
import { PlayerGameRegistrationService } from './player-game-registration.service';
import { CompetitionGameService } from './competition-game.service';
import { User } from 'src/user/models';
import { GameState } from '../enum';

@Injectable()
export class GameSubscriptionService extends DataBaseService<PlayerGameRegistrationDocument> {
  constructor(
    @InjectModel(PlayerGameRegistration.name)
    gameArcardeModel: Model<PlayerGameRegistrationDocument>,
    @InjectConnection() connection: mongoose.Connection,
    private gameArcardeService: GameArcardeService,
    private userService: UsersService,
    private competitionGameService: CompetitionGameService,
    private playerGameRegistrationService: PlayerGameRegistrationService,
  ) {
    super(gameArcardeModel, connection, []);
  }

  async getArcadeSubscribers(arcadeId: string): Promise<any> {
    const competition = await this.competitionGameService.findOneByField({
      arcadeId: arcadeId,
    });

    if (!competition) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition',
        message: `Game competition not found`,
      });
    }

    const competitions =
      await this.competitionGameService.associateCompetitionAndChildren(
        competition,
        [],
      );

    // Utiliser flatMap pour obtenir un tableau plat d'abonnés
    const subscribers = await Promise.all(
      competitions.flatMap((game) =>
        game.playerGameRegistrations.map(async (subscriber) => {
          const user = await this.userService.findOneByField({
            _id: subscriber.player.toString(),
          });
          return user;
        }),
      ),
    );
    return subscribers;
  }

  async getCompetitionSubscribers(competitionId: string): Promise<any> {
    const game = await this.competitionGameService.findOneByField({
      _id: competitionId,
    });
    if (game) {
      const subscribers = await Promise.all(
        game.playerGameRegistrations.map(async (subscriber) => {
          const user = await this.userService.findOneByField({
            _id: subscriber.player.toString(),
          });
          return user;
        }),
      );

      return subscribers;
    }

    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'NotFound/GameCompetition',
      message: `Game competition not found`,
    });
  }

  async subscribePlayer(gameId: string, subscriberId: string) {
    let gameCompetition = await this.competitionGameService.findOneByField({
      _id: gameId,
    });
    if (!gameCompetition)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-subscription',
        message: `Game Competition not found`,
      });
    const arcadeId = await this.competitionGameService.getCompatitionArcadeId(
      gameCompetition,
    );
    let arcade = await this.gameArcardeService.findOneByField({
      _id: arcadeId,
    });
    if (!arcade)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameArcarde-subscription',
        message: `Game arcarde not found`,
      });

    if (!arcade.canRegisterPlayer)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'UnableSubscription/GameArcarde-subscription',
        message: `Unable to subscribe the player to the game`,
      });

    if (!arcade.isFreeRegistrationPlayer)
      throw new ServiceUnavailableException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'ServiceNotFound/GameArcarde-subscription',
        message: `Paid games not yet supported.`,
      });

    const arcadeSubscribers = await this.getArcadeSubscribers(arcade.id);
    if (arcade.maxPlayersNumber <= arcadeSubscribers.length)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'MaxPlayer/GameArcarde-subscription',
        message: `Maximum number of players already reached`,
      });

    let player = await this.userService.findOneByField({ _id: subscriberId });
    if (!player)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/PlayerGame-subscription',
        message: `Player not found`,
      });
    let foundPlayer = gameCompetition.playerGameRegistrations.findIndex(
      (pl) => pl.player._id.toString() == subscriberId,
    );
    if (foundPlayer >= 0)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'AlreadyExists/GameArcarde-subscription',
        message: `Player already subscribed to the game`,
      });
    const dateNow = new Date();
    if (
      arcade.startRegistrationDate > dateNow ||
      arcade.endRegistrationDate < dateNow
    )
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'DateRegistration/GameArcarde-subscription',
        message: `Unable to register player for this game because player registration date is not allowed for this game`,
      });

    return this.executeWithTransaction(async (session) => {
      let gameSubscription = await this.playerGameRegistrationService.create(
        { player, localisation: gameCompetition.localisation },
        session,
      );
      if (!gameCompetition.playerGameRegistrations) {
        gameCompetition.playerGameRegistrations = []; // Crée le tableau s'il n'existe pas
      }
      gameCompetition.playerGameRegistrations.push(gameSubscription);
      let playerSubscription = gameCompetition.save({ session });

      gameSubscription.competition = gameCompetition;
      await gameSubscription.save({ session });

      return playerSubscription;
    });
  }

  async unsubscribePlayer(gameSubscriptionDTO: PlayerUnSubscriptionDTO) {
    const player = await this.userService.findOneByField({
      _id: gameSubscriptionDTO.playerID,
    });

    if (!player) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/PlayerGame-unsubscription',
        message: [`Player not found`],
      });
    }

    if (gameSubscriptionDTO.gameID) {
      return await this.competitionUnsubscription(
        gameSubscriptionDTO.gameID,
        gameSubscriptionDTO.playerID,
      );
    } else if (gameSubscriptionDTO.arcadeID) {
      const arcade = await this.gameArcardeService.findOneByField({
        _id: gameSubscriptionDTO.arcadeID,
      });

      if (!arcade) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/GameArcarde-unsubscription',
          message: [`Game arcade not found`],
        });
      }

      const competition = await this.competitionGameService.findOneByField({
        arcadeId: gameSubscriptionDTO.arcadeID,
      });

      if (!competition) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/Competition',
          message: [`Competition not found`],
        });
      }

      const competitions =
        await this.competitionGameService.associateCompetitionAndChildren(
          competition,
          [],
        );

      return await Promise.all(
        competitions.map(async (comp) => {
          return this.competitionUnsubscription(
            comp._id,
            gameSubscriptionDTO.playerID,
          );
        }),
      );
    }
  }

  async competitionUnsubscription(competitionId: ObjectId, playerID: ObjectId) {
    const competition = await this.competitionGameService.findOneByField({
      _id: competitionId,
    });

    if (!competition) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/Competition',
        message: [`Competition not found`],
      });
    }

    return this.executeWithTransaction(async (session) => {
      const foundPlayerIndex = competition.playerGameRegistrations.findIndex(
        (registration) => registration.player._id.equals(playerID),
      );

      if (foundPlayerIndex !== -1) {
        await this.playerGameRegistrationService.delete({
          _id: competition.playerGameRegistrations[foundPlayerIndex]._id,
        });

        competition.playerGameRegistrations.splice(foundPlayerIndex, 1);

        return competition.save({ session });
      }
    });
  }

  async playerSubscribedCompetitions(playerId: string, gameStates: string[]) {
    // Récupérer toutes les compétitions
    const allCompetitions = await this.competitionGameService.findAll();
    
    const dateNow = new Date();
    // Filtrer les compétitions où le joueur est inscrit
    const playerCompetitions = allCompetitions.filter(competition =>
      (competition.endDate > dateNow) && (gameStates.includes(competition.gameState)) && competition.playerGameRegistrations.some(subscriber => {
        return subscriber.player.toString() === playerId.toString();
      })
    );
    
    // Populer les compétitions trouvées avec les relations nécessaires
    const populatedCompetitions = await Promise.all(
      playerCompetitions.map(competition => 
        competition.populate(["gameParts", "gameLevel"])
      )
    );
  
    return populatedCompetitions;
  }

}
