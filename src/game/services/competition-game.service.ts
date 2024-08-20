import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { DataBaseService } from 'src/shared/services/database';
import mongoose, { Model, Types } from 'mongoose';
import {
  CompetitionGame,
  CompetitionGameDocument,
  GameArcarde,
} from '../models';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  forwardRef,
} from '@nestjs/common';
import {
  ApplyGameWriteriaToGammeDTO,
  ChangeGameCompetitionStateDTO,
  CreateCompetitionGameDTO,
  PlayerSubscriptionDTO,
  UpdateGameCompetitionGameDTO,
} from '../dtos';
import { UsersService } from 'src/user/services';
import { GameWinnerCriteriaService } from './game-winner-criteria.service';
import { GameArcardeService } from './game-arcarde.service';
import { GameLevelService } from 'src/gamelevel/services';
import { GameState } from '../enum';
import { User } from 'src/user/models';
import { PlayerGameRegistrationService } from './player-game-registration.service';

@Injectable()
export class CompetitionGameService extends DataBaseService<CompetitionGameDocument> {
  constructor(
    @InjectModel(CompetitionGame.name)
    competitionGameModel: Model<CompetitionGameDocument>,
    @InjectConnection() connection: mongoose.Connection,
    private usersService: UsersService,
    private gameWinnerCriteriaService: GameWinnerCriteriaService,
    private playerGameRegistrationService: PlayerGameRegistrationService,
    private gameArcardeService: GameArcardeService,
    private gameLevelService: GameLevelService,
  ) {
    super(competitionGameModel, connection, [
      'gameLevel',
      'gameParts',
      'gameWinnerCriterias',
      'playerGameRegistrations',
    ]);
  }

  async createNewCompetition(
    createCompetitionGameDTO,
    gameArcardeID: string,
    session = null,
    game = null, //CreateCompetitionGameDTO
  ) {
    let judge = null,
      parentCompetition = null,
      gamesCriteria = [],
      gameLevel = null;
    let gameArcarde = game;
    if (!gameArcarde)
      gameArcarde = await this.gameArcardeService.findOneByField({
        _id: gameArcardeID,
      });
    if (!gameArcarde)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-GameArcarde',
        message: [`Game arcarde of the competition not found`],
      });

    if (createCompetitionGameDTO.gameJudgeID) {
      judge = await this.usersService.findOneByField({
        _id: createCompetitionGameDTO.gameJudgeID,
      });
      if (!judge)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/GameCompetition-Judge',
          message: [`Judge of the competition not found`],
        });
    }

    if (createCompetitionGameDTO.parentCompetition) {
      parentCompetition = await this.findOneByField({
        _id: createCompetitionGameDTO.parentCompetition,
      });
      if (!parentCompetition)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/GameCompetition-ParentCompetition',
          message: [`Parent competition not found`],
        });
    }

    if (createCompetitionGameDTO.gameLevel) {
      gameLevel = await this.gameLevelService.findOneByField({
        _id: createCompetitionGameDTO.gameLevel,
      });
      if (!gameLevel)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/GameCompetition-GameLevel',
          message: [`Game Level not found`],
        });
    }

    if (createCompetitionGameDTO.gameWinnerCriterias) {
      gamesCriteria = await createCompetitionGameDTO.gameWinnerCriterias.map(
        (criteriaID) =>
          this.gameWinnerCriteriaService.findOneByField({ _id: criteriaID }),
      );
      gamesCriteria.forEach((criteria) => {
        if (!criteria)
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error: 'NotFound/GameCompetition-WinnerCompetition',
            message: [`A winning criterion of the competition is not found`],
          });
      });
    } else createCompetitionGameDTO.gameWinnerCriterias = [];

    // if(session)

    const exectSaveCompetition = async (transaction) => {
      let competitionGame = await this.create(
        {
          ...createCompetitionGameDTO,
          gameJudge: judge,
          parentCompetition,
          gameArcarde,
          gameWinnerCriterias: gamesCriteria,
          // gameParts: (createCompetitionGameDTO.gameParts && createCompetitionGameDTO.gameParts.length>0) ?
          //     (await createCompetitionGameDTO.gameParts.map((parts)=>this.gamePartService.create(parts,transaction))) :
          //     [],
          gameLevel,
        },
        transaction,
      );
      gameArcarde.competitionGames.push(competitionGame);
      await gameArcarde.save({ session: transaction });
      return competitionGame;
    };

    if (session) return exectSaveCompetition(session);
    return this.executeWithTransaction((transaction) =>
      exectSaveCompetition(transaction),
    );
  }

  async updateCompetition(
    updateCompetitionGameDTO: UpdateGameCompetitionGameDTO,
    competitionGameID: String,
  ) {
    let competition = await this.findOneByField({ _id: competitionGameID }),
      parentCompetition = null,
      judge = null,
      gamesCriteria = null;
    if (!competition)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-competition',
        message: [`Game competition not found`],
      });

    if (updateCompetitionGameDTO.parentCompetition) {
      parentCompetition = await this.findOneByField({
        _id: updateCompetitionGameDTO.parentCompetition,
      });
      if (!parentCompetition)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/GameCompetition-ParentCompetition',
          message: [`Parent competition not found`],
        });

      // if (competition.parentCompetition?._id != parentCompetition?._id)
        // competition.parentCompetition = parentCompetition._id;
      // competition.parentCompetition = new Types.ObjectId(parentCompetition?._id);
    }

    if (updateCompetitionGameDTO.gameJudgeID) {
      judge = await this.usersService.findOneByField({
        _id: updateCompetitionGameDTO.gameJudgeID,
      });
      if (!judge)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound/GameCompetition-Judge',
          message: [`Judge of the competition not found`],
        });

      if (competition.gameJudge && competition.gameJudge.id != judge.id)
        competition.gameJudge = judge;
    }

    if (updateCompetitionGameDTO.gameWinnerCriterias) {
      gamesCriteria = await updateCompetitionGameDTO.gameWinnerCriterias.map(
        (criteriaID) =>
          this.gameWinnerCriteriaService.findOneByField({ _id: criteriaID }),
      );
      gamesCriteria.forEach((criteria) => {
        if (!criteria)
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error: 'NotFound/GameCompetition-WinnerCompetition',
            message: [`A winning criterion of the competition is not found`],
          });
      });

      competition.gameWinnerCriterias = gamesCriteria;
    }

    return competition.update({
      ...updateCompetitionGameDTO,
      gameJudge: judge,
      parentCompetition: new Types.ObjectId(parentCompetition?._id),
      gameWinnerCriterias: gamesCriteria,
    });
  }

  async appyCriteriaToGame(
    applyGameWriteriaToGammeDTO: ApplyGameWriteriaToGammeDTO,
  ) {
    let gameCompetition = await this.findOneByField({
      _id: applyGameWriteriaToGammeDTO.gameID,
    });
    if (!gameCompetition)
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'GameCompetitionNotFound/GameCompetition',
        message: [`Game competition not found`],
      });
    console.log(gameCompetition);

    let criteriaExist = await gameCompetition.gameWinnerCriterias.find(
      (id) => id._id.toString() == applyGameWriteriaToGammeDTO.gammeWinnersID,
    );
    console.log(criteriaExist);
    if (criteriaExist) {
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'GameCriteria/AlreadyExiste',
        message: [`Game criteria already exist`],
      });
    } else {
      let winnerCriteria = await this.gameWinnerCriteriaService.findOneByField({
        _id: applyGameWriteriaToGammeDTO.gammeWinnersID,
      });
      console.log(winnerCriteria);
      if (!winnerCriteria) {
        throw new BadRequestException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'GameCriteriaNotFound/GameCompetition',
          message: [`Game criteria not found`],
        });
      } else {
        await gameCompetition.gameWinnerCriterias.push(winnerCriteria);
        return gameCompetition.save();
      }
    }
  }

  async removeCriteriaToGame(objectReceiveFromFrontend) {
    let gameCompetition = await this.findOneByField({
      _id: objectReceiveFromFrontend.gameID,
    });
    if (!gameCompetition)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'GameCompetitionNotFound/GameCompetition',
        message: [`Game competition not found`],
      });

    let gameCriteriaIndex = await gameCompetition.gameWinnerCriterias.findIndex(
      (id) => id._id.toString() == objectReceiveFromFrontend.gammeWinnersID,
    );
    if (gameCriteriaIndex > -1) {
      await gameCompetition.gameWinnerCriterias.splice(gameCriteriaIndex, 1);
    } else {
      console.log('Critere introuvable');
    }

    return gameCompetition.save();
  }

  async changeGameCompetiton(
    changeGameStateDTO: ChangeGameCompetitionStateDTO,
  ) {
    let gameArcarde = await this.gameArcardeService.findOneByField({
      _id: changeGameStateDTO.gameArcardeID,
    });
    if (!gameArcarde)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-changestate',
        message: [`Game arcarde not found`],
      });
    let dateNow = new Date();
    if (gameArcarde.gameState != GameState.RUNNING)
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-start',
        message: [
          `The state of the arcade must be in "In Progress" state for the competition to start`,
        ],
      });

    let competition = gameArcarde.competitionGames.find(
      (compet) => compet.id == changeGameStateDTO.gameCompetitionID,
    );
    if (!competition)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-changestate-start',
        message: [`The competition was not found`],
      });

    if (
      changeGameStateDTO.state == GameState.RUNNING &&
      (dateNow < competition.startDate || dateNow > competition.endDate)
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-start',
        message: [
          `The current date does not correspond to the start and end date of the game`,
        ],
      });
    else if (
      changeGameStateDTO.state == GameState.END &&
      dateNow < gameArcarde.endDate
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-end',
        message: [
          `The competition is over! it is no longer possible to start it`,
        ],
      });

    // gameArcarde.competitionGames
    // competition.gameState=changeGameStateDTO.state;
    return this.update(
      { _id: changeGameStateDTO.gameCompetitionID },
      { gameState: changeGameStateDTO.state },
    );
    // return competition.update();
  }

  // async getListCompetitorSubscriptor(id: string) {
  //   let data = await this.findOneByField({ _id: id });
  //   if (!data)
  //     throw new BadRequestException({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       error: 'GameCompetitionNotFound/GameCompetition',
  //       message: [`Game compétition not found`],
  //     });
  //   return data.playerGameRegistrations;
  // }

  // async getListCompetitionParticipants(id: string) {
  //   const listPlayer = [];
  //   let competition = await this.findOneByField({ _id: id });
  //   if (!competition)
  //     throw new BadRequestException({
  //       statusCode: HttpStatus.NOT_FOUND,
  //       error: 'GameCompetitionNotFound/GameCompetition',
  //       message: [`Game compétition not found`],
  //     });

  //   for (let playerGameRegistration of competition.playerGameRegistrations) {
  //     let user = await this.usersService.findOneByField({
  //       _id: playerGameRegistration.player,
  //     });
  //     if (!user)
  //       throw new BadRequestException({
  //         statusCode: HttpStatus.NOT_FOUND,
  //         error: 'PlayerNotFound/GameCompetition',
  //         message: [`Player of that game competition not found`],
  //       });
  //     listPlayer.push(user);
  //   }

  //   console.log('list Of Player :', listPlayer);
  //   return listPlayer;
  // }

  async associateCompetitionAndChildren(
    competition: CompetitionGame,
    competitions: CompetitionGame[],
  ): Promise<CompetitionGame[]> {
    competitions.push(competition);
    let children = await this.findByField({
      parentCompetition: competition._id,
    });
    if (children && children.length > 0) {
      for (const child of children) {
        competitions.push(child);
        await this.buildCompetitionTree(child);
      }
    }
    return competitions;
  }

  async buildCompetitionTree(
    competition: CompetitionGame,
  ): Promise<CompetitionGame> {
    let children = await this.findByField({
      parentCompetition: competition._id,
    });
    if (children && children.length > 0) {
      for (const child of children) {
        await this.buildCompetitionTree(child);
      }
      competition.children = children;
    }
    return competition;
  }

  async getLeafCompetitionLcations(
    competition: CompetitionGame,
    competitions: string[],
  ): Promise<string[]> {
    let children = await this.findByField({
      parentCompetition: competition._id,
    });
    if (children && children.length > 0) {
      for (const child of children) {
        await this.getLeafCompetitionLcations(child, competitions);
      }
    } else competitions.push(competition.localisation);

    return competitions;
  }

  async getCompatitionArcadeId(competition: CompetitionGame): Promise<string> {
    if (competition.parentCompetition) {
      // Récursivité : Attendre que l'appel récursif retourne une valeur.
      const parent = await this.findOneByField({
        _id: competition.parentCompetition.toString(),
      });
      // Retourner la valeur obtenue récursivement
      return this.getCompatitionArcadeId(parent);
      // return this.getCompatitionArcadeId(competition.parentCompetition);
    } else if (!competition.arcadeId) {
      // Lancer une exception si arcadeId n'existe pas
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameArcarde-subscription',
        message: `Game arcarde not found`,
      });
    } else return competition.arcadeId;
  }
}
