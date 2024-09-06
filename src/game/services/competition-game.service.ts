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
  ConflictException,
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
  UpdateGameCompetitionGameDTO,
} from '../dtos';
import { UsersService } from 'src/user/services';
import { GameWinnerCriteriaService } from './game-winner-criteria.service';
import { GameArcardeService } from './game-arcarde.service';
import { GameLevelService } from 'src/gamelevel/services';
import { GameState } from '../enum';
import { PlayerGameRegistrationService } from './player-game-registration.service';
import { JsonResponse } from 'src/shared/helpers/json-response';

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
    private jsonResponse: JsonResponse,
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
    competitionGameID: string,
  ) {
    let competition = await this.findOneByField({ _id: competitionGameID }),
      parentCompetition = null,
      judge = null,
      gamesCriteria = null;
    if (!competition)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-competition',
        message: `Game competition not found`,
      });
    
    const existsGame = await this.findOneByField({name: updateCompetitionGameDTO.name})
    if(existsGame?._id.toString() !== competitionGameID)  {
        throw new ConflictException(this.jsonResponse.error(`Competition already exists`,{alreadyUsed: true}));
    }

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

  async applyCriteriaToGame(
    applyGameWriteriaToGammeDTO: ApplyGameWriteriaToGammeDTO,
  ) {
    let gameCompetition = await this.findOneByField({
      _id: applyGameWriteriaToGammeDTO.gameID,
    });
    if (!gameCompetition) {
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'GameCompetitionNotFound/GameCompetition',
        message: [`Game competition not found`],
      });
    }

    return this.executeWithTransaction(async (session) => {
      gameCompetition.gameWinnerCriterias = [];

      for (const criteria of applyGameWriteriaToGammeDTO.gammeWinnersID) {
        let winnerCriteria =
          await this.gameWinnerCriteriaService.findOneByField({
            _id: criteria,
          });

        if (winnerCriteria) {
          gameCompetition.gameWinnerCriterias.push(winnerCriteria);
        }
      }
      return await gameCompetition.save();
    });
  }

  async removeCriteriaToGame(objectReceiveFromFrontend) {
    let gameCompetition = await this.findOneByField({
      _id: objectReceiveFromFrontend.gameID,
    });
  
    if (!gameCompetition) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'GameCompetitionNotFound/GameCompetition',
        message: [`Game competition not found`],
      });
    }
  
    let gameCriteriaIndex = gameCompetition.gameWinnerCriterias.findIndex(
      (criteria) => criteria._id.toString() === objectReceiveFromFrontend.gammeWinnersID
    );
  
    if (gameCriteriaIndex > -1) {
      // Supprimer le critère si trouvé
      gameCompetition.gameWinnerCriterias.splice(gameCriteriaIndex, 1);
    }
  
    // Sauvegarder les modifications
    return await gameCompetition.save();
  }
  

  async changeGameCompetiton(
    changeGameStateDTO: ChangeGameCompetitionStateDTO,
  ) {
    let competition = await this.findOneByField(
      {_id: changeGameStateDTO.gameCompetitionID}
    );
    if (!competition)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-changestate-start',
        message: `The competition was not found`,
      });

    const gameArcardeId = await this.getCompatitionArcadeId(competition);
    let gameArcarde = await this.gameArcardeService.findOneByField({
      _id: gameArcardeId,
    });
    if (!gameArcarde)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound/GameCompetition-changestate-arcade',
        message: `Game arcarde not found`,
      });
    if (gameArcarde.gameState != GameState.RUNNING)
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-start',
        message: `The state of the arcade must be in "In Progress" state for the competition to start`,
      });

    const dateNow = new Date();
    if (
      changeGameStateDTO.state == GameState.RUNNING &&
      (dateNow < competition.startDate || dateNow > competition.endDate)
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-start',
        message: `The current date does not correspond to the start and end date of the game`,
      });
    else if (
      changeGameStateDTO.state == GameState.RUNNING &&
      dateNow > gameArcarde.endDate
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-end',
        message: `The competition is over! it is no longer possible to start it`,
      });
    else if (
      (changeGameStateDTO.state == GameState.RUNNING) &&
      (competition.gameParts.length <= 0)
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-no-parts',
        message: `The competition does not include any rounds`,
      });
    else if (
      changeGameStateDTO.state == GameState.END &&
      dateNow < gameArcarde.endDate
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-end',
        message: `The competition is not over! it is no longer possible to stop it`,
      });
    else if (
      (changeGameStateDTO.state == GameState.WAITING_PLAYER) &&
      (competition.playerGameRegistrations.length < competition.minOfPlayers)
    )
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden/GameCompetition-changestate-minOfPlayers',
        message: `The minimum number of players is not reached`,
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
        await this.associateCompetitionAndChildren(child, competitions);
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
    competitions: any[],
  ): Promise<string[]> {
    let children = await this.findByField({
      parentCompetition: competition._id,
    });
    if (children && children.length > 0) {
      for (const child of children) {
        await this.getLeafCompetitionLcations(child, competitions);
      }
    } else competitions.push({_id: competition._id, location: competition.localisation});

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

  async formalDelete(competitionId: string) {
    let competition = await this.findOneByField({
      _id: competitionId,
    });
    if (!competition) {
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'GameCompetitionNotFound/GameCompetition',
        message: [`Game competition not found`],
      });
    }
  
    // Récupérer toutes les compétitions associées
    let competitions = await this.associateCompetitionAndChildren(competition, []);
  
    return this.executeWithTransaction(async (session) => {
      // Supprimer les enregistrements de joueurs pour chaque compétition
      for (let compet of competitions) {
        let registersIds = compet.playerGameRegistrations.map((comp) => comp._id);
  
        let conditionFilter = { '_id': { $in: registersIds } };
  
        // Suppression avec la session
        await this.playerGameRegistrationService.deleteMany(conditionFilter);
      }
  
      let competIds = competitions.map((comp) => comp._id);
  
      let condition = { '_id': { $in: competIds } };
  
      // Suppression des compétitions avec la session
      return await this.deleteMany(condition);
    });
  }
  
}
