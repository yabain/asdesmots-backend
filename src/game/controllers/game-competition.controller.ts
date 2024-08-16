import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Delete,
  Query,
  ParseArrayPipe,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ObjectIDValidationPipe } from 'src/shared/pipes';
import { SecureRouteWithPerms } from 'src/shared/security';
import {
  ApplyGameWriteriaToGammeDTO,
  ChangeGameCompetitionStateDTO,
  CreateCompetitionGameDTO,
  PlayerSubscriptionDTO,
  UpdateGameCompetitionGameDTO,
} from '../dtos';
import { GameCompetitionPerms } from '../enum';
import {
  CompetitionGameService,
  PlayerGameRegistrationService,
} from '../services';
import { Request, Response } from 'express';
import { JsonResponse } from 'src/shared/helpers/json-response';
import { AuthGuard } from 'src/authorization/guards/auth.guard';
import { UsersService } from 'src/user/services';

@Controller('game-competition')
export class GameCompetitionController {
  constructor(
    private competitionGameService: CompetitionGameService,
    private playerGameSubscription: PlayerGameRegistrationService,
    private jsonResponse: JsonResponse,
    private usersService: UsersService,
  ) {}

  @Get('by-arcade/:arcadeId')
  async getCompetitionsByArcade(
    @Param('arcadeId') arcadeId: string,
    @Res() res: Response,
  ) {
    const parentCompetition = await this.competitionGameService.findOneByField({ 'arcadeId': arcadeId });
    const data = parentCompetition ? await this.competitionGameService.buildCompetitionTree(parentCompetition) : null;

    // console.log('competition with children', data)

    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Arcade competition', data));
  }

  
  @Get('arcade-competition-and-sub-competitions/:arcadeId')
  async getArcadeCompetitionsWithSubCompetitions(
    @Param('arcadeId') arcadeId: string,
    @Res() res: Response,
  ) {
    const parentCompetition = await this.competitionGameService.findOneByField({ 'arcadeId': arcadeId });
    const data = parentCompetition ? await this.competitionGameService.associateCompetitionAndChildren(parentCompetition, []) : [];

    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Arcade competition', data));
  }

  @Get('arcade-competition-locations/:arcadeId')
  async getArcadeCompetitionLocations(
    @Param('arcadeId') arcadeId: string,
    @Res() res: Response,
  ) {
    const parentCompetition = await this.competitionGameService.findOneByField({ 'arcadeId': arcadeId });
    const data = parentCompetition ? await this.competitionGameService.getLeafCompetitionLcations(parentCompetition, []) : [];

    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Arcade competition locations', data));
  }

  @UseGuards(AuthGuard)
  @Post('subscribe')
  async subscribeToCompetition(
    @Req() request: Request,
    @Body() data: any,
    @Res() res: Response,
  ) {
    const user = request.authUser
    const authenticatedUser = await this.usersService.findOneByField({
      email: user.email,
    });
    await this.competitionGameService.subscribeUser(data.location, authenticatedUser._id);

    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Subscription procced successfully'));
  }

  /**
   *
   * @api {post} /game-competition/:gameArcardeID create new game competition
   * @apiDescription create new game competition
   * @apiParam {String} gameArcardeID Arcade game id
   * @apiName Create game competition
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiUse apiDefaultResponse
   * @apiUse CreateCompetitionGameDTO
   * @apiPermission GameCompetitionPerms.CREATE
   *
   * @apiSuccess (201 Created) {Number} statusCode status code
   * @apiSuccess (201 Created) {String} Response Description
   * @apiSuccess (201 Created) {Object} data response data
   * @apiSuccess (201 Created) {String {4..65}} name Game competition name
   * @apiSuccess (201 Created) {String {4..65}} description Game competition description
   * @apiSuccess (200 Ok) {Object} gameLevel level of games
   * @apiSuccess (200 Ok) {String} gameLevel.name game level name
   * @apiSuccess (200 Ok) {String} gameLevel.description game level description
   * @apiSuccess (201 Created) {Boolean} isSinglePart It's set to true if it's a one-party competition
   * @apiSuccess (201 Created) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
   * @apiSuccess (201 Created) {String} localisation  competition location area
   * @apiSuccess (201 Created) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
   * @apiSuccess (201 Created) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
   * @apiSuccess (201 Created) {Date} startDate game start date
   * @apiSuccess (201 Created) {Date} endDate game end date
   * @apiSuccess (201 Created) {Number} maxOfWinners  Maximum number of winners per competition
   * @apiSuccess (201 Created) {String} lang Language of the competition. it can be "en" for English and "fr" for French
   * @apiSuccess (201 Created) {String} parentCompetition In case it is a sub competition, this value represents the parent competition
   * @apiSuccess (201 Created) {String[]} gameWinnerCriterias competition winning criteria ID table
   * @apiSuccess (201 Created) {String[]} gameJudgesID competition judge ID
   * @apiSuccess (201 Created) {GamePart[]} gameJudges competition judges ID table
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiUse apiError
   *
   */
  @UseGuards(AuthGuard)
  @Post(':gameArcardeID')
  @SecureRouteWithPerms()
  // GameCompetitionPerms.CREATE
  async create(
    @Body() createCompetitionGameDTO: CreateCompetitionGameDTO,
    @Param('gameArcardeID') gameArcardeID: string,
    @Res() res: Response,
  ) {
    await this.competitionGameService.createNewCompetition(
      { ...createCompetitionGameDTO, arcadeId: gameArcardeID },
      gameArcardeID,
    );

    return res
      .status(HttpStatus.CREATED)
      .json(this.jsonResponse.success('Competition successfully created'));
  }

  /**
   * @api {put} /game-competition/apply-criteria Apply a game winning criteria to a game
   * @apidescription Apply a game winning criteria to a game
   * @apiName Apply winning criteria to a game
   * @apiGroup Game Competition
   * @apiUse ApplyGameWriteriaToGammeDTO
   * @apiUse apiSecurity
   * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
   * @apiSuccess (200 Ok) {String} Response Description
   * @apiSuccess (200 Ok) {Object} data response Array
   * @apiSuccess (200 Ok) {String} data.name  Winner criteria name
   * @apiSuccess (200 Ok) {String} data.description Winner criteria description
   * @apiSuccess (200 Ok) {String} data.gameWinnerCriteriaType Winner criteria type
   * @apiSuccess (200 Ok) {Date} data.createdAt Creation date of the winning criteria
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiError (Error 4xx) 404-NotFound Game Competition not found
   * @apiUse apiError
   */
  @Put('apply-criteria')
  async applyGameWriteriaToGamme(
    @Body() applyGameWriteriaToGammeDTO: ApplyGameWriteriaToGammeDTO,
  ) {
    await this.competitionGameService.appyCriteriaToGame(
      applyGameWriteriaToGammeDTO,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Winning criterion of a competition successfully added',
    };
  }

  /**
       * @api {put} /game-competition/state Changing the state of the competition. this allows you to start and end an arcade
       * @apidescription Changing the state of the competition. this allows you to start and end an competition
       * @apiName Changing the state of the arcarde.
       * @apiGroup Game Competition
       * @apiUse ChangeGameCompetitionStateDTO
       * @apiUse apiSecurity 
       * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
       * @apiSuccess (200 Ok) {String} Response Description
      
       * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
       * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
       * @apiUse apiError
       */
  @SecureRouteWithPerms()
  @Put('/state')
  async changeArcardeState(
    @Body() changeGameStateDTO: ChangeGameCompetitionStateDTO,
  ) {
    await this.competitionGameService.changeGameCompetiton(changeGameStateDTO);
    return {
      statusCode: HttpStatus.OK,
      message: 'Update game competition state',
    };
  }

  @Delete('/:competitionId')
  async deletecompetition(
    @Param('competitionId', ObjectIDValidationPipe) competitionId: string,
  ) {

    await this.competitionGameService.delete({"parentCompetition":competitionId});
    await this.competitionGameService.delete({"_id":competitionId});

    return {
      statusCode: HttpStatus.OK,
      message: 'Competition successfully deleted',
    };
  }

  /**
   * @api {delete} /game-competition/remove-criteria/:gameId/:gameWinnerCriteriasId Remove a game winning criteria to a game
   * @apidescription Remove a game winning criteria from a list of criterion of a game
   * @apiName Remove a game winning criteria from a list of criterion of a game
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
   * @apiSuccess (200 Ok) {String} Response Description
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiError (Error 4xx) 404-NotFound Game Competition not found
   * @apiUse apiError
   */
  @Delete('remove-criteria/:gameId/:gameWinnerCriteriasId')
  async removeGameWriteriaToGamme(
    @Param('gameId', ObjectIDValidationPipe) gameId: string,
    @Param('gameWinnerCriteriasId', ObjectIDValidationPipe)
    gameWinnerCriteriasId: string,
  ) {
    const objectReceiveFromFrontend = {
      gameID: gameId,
      gammeWinnersID: gameWinnerCriteriasId,
    };

    await this.competitionGameService.removeCriteriaToGame(
      objectReceiveFromFrontend,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Criterion winner of a competition withdraw successfully',
    };
  }

  /**
   *
   * @api {put} /game-competition/:id update game competition
   * @apiDescription update game competition
   * @apiParam {String} id Game competition unique ID
   * @apiName Update game competition
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiUse apiDefaultResponse
   * @apiUse UpdateGameCompetitionGameDTO
   * @apiPermission GameCompetitionPerms.CREATE
   *
   * @apiSuccess (200 Ok) {Number} statusCode status code
   * @apiSuccess (200 Ok) {String} Response Description
   * @apiSuccess (200 Ok) {Object} data response data
   * @apiSuccess (200 Ok) {String {4..65}} name Game competition name
   * @apiSuccess (200 Ok) {String {4..65}} description Game competition description
   * @apiSuccess (200 Ok) {Object} gameLevel level of games
   * @apiSuccess (200 Ok) {String} gameLevel.name game level name
   * @apiSuccess (200 Ok) {String} gameLevel.description game level description
   * @apiSuccess (200 Ok) {Boolean} isSinglePart It's set to true if it's a one-party competition
   * @apiSuccess (200 Ok) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
   * @apiSuccess (200 Ok) {String} localisation  competition location area
   * @apiSuccess (200 Ok) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
   * @apiSuccess (200 Ok) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
   * @apiSuccess (200 Ok) {Date} startDate game start date
   * @apiSuccess (200 Ok) {Date} endDate game end date
   * @apiSuccess (200 Ok) {Number} maxOfWinners  Maximum number of winners per competition
   * @apiSuccess (200 Ok) {String} lang Language of the competition. it can be "en" for English and "fr" for French
   * @apiSuccess (200 Ok) {String} parentCompetition In case it is a sub competition, this value represents the parent competition
   * @apiSuccess (200 Ok) {String[]} gameWinnerCriterias competition winning criteria ID table
   * @apiSuccess (200 Ok) {String} gameJudgeID competition judge ID
   * @apiSuccess (200 Ok) {CreateGamePartDTO[]} gameJudges competition judges ID table
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiUse apiError
   *
   */
  @Put(':id')
  @SecureRouteWithPerms()
  async updateGameCompetition(
    @Body() updateGameCompetitionDTO: UpdateGameCompetitionGameDTO,
    @Param('id') gameCompetitionID: String,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Game competition updated',
      data: await this.competitionGameService.updateCompetition(
        updateGameCompetitionDTO,
        gameCompetitionID,
      ),
    };
  }

  /**
   *
   * @api {get} /game-competition/subscriber/:id get game competition by subscriber id
   * @apiDescription get game competition by subscriber id
   * @apiParam {String} id user unique ID
   * @apiName Get game competition by subscriber id
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiUse apiDefaultResponse
   * @apiPermission GameCompetitionPerms.OWNER
   *
   * @apiSuccess (200 Ok) {Number} statusCode status code
   * @apiSuccess (200 Ok) {String} Response Description
   * @apiSuccess (200 Ok) {Array} data response data
   * @apiSuccess (200 Ok) {String {4..65}} name Game competition name
   * @apiSuccess (200 Ok) {String {4..65}} description Game competition description
   * @apiSuccess (200 Ok) {Object} gameLevel level of games
   * @apiSuccess (200 Ok) {String} gameLevel.name game level name
   * @apiSuccess (200 Ok) {String} gameLevel.description game level description
   * @apiSuccess (200 Ok) {Boolean} isSinglePart It's set to true if it's a one-party competition
   * @apiSuccess (200 Ok) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
   * @apiSuccess (200 Ok) {String} localisation  competition location area
   * @apiSuccess (200 Ok) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
   * @apiSuccess (200 Ok) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
   * @apiSuccess (200 Ok) {Date} startDate game start date
   * @apiSuccess (200 Ok) {Date} endDate game end date
   * @apiSuccess (200 Ok) {Number} maxOfWinners  Maximum number of winners per competition
   * @apiSuccess (200 Ok) {String} lang Language of the competition. it can be "en" for English and "fr" for French
   * @apiSuccess (200 Ok) {String} parentCompetition In case it is a sub competition, this value represents the parent competition
   * @apiSuccess (200 Ok) {String[]} gameWinnerCriterias competition winning criteria ID table
   * @apiSuccess (200 Ok) {String} gameJudgeID competition judge ID
   * @apiSuccess (200 Ok) {GamePart[]} gameParts competition judges ID table
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiUse apiError
   *
   */
  @Get('/subscriber/:id')
  @SecureRouteWithPerms()
  async getGameCompetitionBySubscriber(
    @Param('id', ObjectIDValidationPipe) id: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Game competition subscriber details',
      data: await this.playerGameSubscription.getListOfGameSubscriptionByPlayerId(
        id,
      ),
    };
  }

  /**
   * @api {get} /game-competition/:id/subscription Obtention de la liste des souscripteur a une compétition
   * @apidescription  Obtention de la liste des souscripteur a une compétition
   * @apiName  Obtention de la liste des souscripteur a une compétition
   * @apiParam {String} id Identifiant de compétition
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
   * @apiSuccess (200 Ok) {String} Response Description
   * @apiSuccess (200 Ok) {Object} data response data
   * @apiSuccess (200 Ok) {String} data._id identifiant
   * @apiSuccess (200 Ok) {Number} data.lifeGame nombre de vie du joueur
   * @apiSuccess (200 Ok) {Boolean} data.hasLostGame Est définis sur vrai si le joueur a déjà perdu la parti
   * @apiSuccess (200 Ok) {String} data.player Identifiant du joueur.
   * @apiSuccess (200 Ok) {String} data.localisation zone de localisation  du jeu
   * @apiSuccess (200 Ok) {Date} data.createdAt date e souscription du joueur a un jeu
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
   * @apiUse apiError
   */
  @Get(':id/subscription')
  async getSubscription(@Param('id', ObjectIDValidationPipe) id: string) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Get list of competition subscriptor',
      data: await this.competitionGameService.getListCompetitorSubscriptor(id),
    };
  }

  /**
   *
   * @api {get} /game-competition/:id get game competition
   * @apiDescription get game competition by id
   * @apiParam {String} id Game competition unique ID
   * @apiName Get game competition
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiUse apiDefaultResponse
   * @apiPermission GameCompetitionPerms.OWNER
   *
   * @apiSuccess (200 Ok) {Number} statusCode status code
   * @apiSuccess (200 Ok) {String} Response Description
   * @apiSuccess (200 Ok) {Object} data response data
   * @apiSuccess (200 Ok) {String {4..65}} name Game competition name
   * @apiSuccess (200 Ok) {String {4..65}} description Game competition description
   * @apiSuccess (200 Ok) {Object} gameLevel level of games
   * @apiSuccess (200 Ok) {String} gameLevel.name game level name
   * @apiSuccess (200 Ok) {String} gameLevel.description game level description
   * @apiSuccess (200 Ok) {Boolean} isSinglePart It's set to true if it's a one-party competition
   * @apiSuccess (200 Ok) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
   * @apiSuccess (200 Ok) {String} localisation  competition location area
   * @apiSuccess (200 Ok) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
   * @apiSuccess (200 Ok) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
   * @apiSuccess (200 Ok) {Date} startDate game start date
   * @apiSuccess (200 Ok) {Date} endDate game end date
   * @apiSuccess (200 Ok) {Number} maxOfWinners  Maximum number of winners per competition
   * @apiSuccess (200 Ok) {String} lang Language of the competition. it can be "en" for English and "fr" for French
   * @apiSuccess (200 Ok) {String} parentCompetition In case it is a sub competition, this value represents the parent competition
   * @apiSuccess (200 Ok) {String[]} gameWinnerCriterias competition winning criteria ID table
   * @apiSuccess (200 Ok) {String} gameJudgeID competition judge ID
   * @apiSuccess (200 Ok) {GamePart[]} gameParts competition judges ID table
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiUse apiError
   *
   */
  @Get(':id')
  @SecureRouteWithPerms()
  async getGameCompetitionById(
    @Param('id', ObjectIDValidationPipe) id: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Game competition details',
      data: await this.competitionGameService.findOneByField({ _id: id }),
    };
  }

  /**
   *
   * @api {get} /game-competition/participants/:id get list participants of a game competition
   * @apiDescription get all the participants of a game competition by id
   * @apiParam {String} id Game competition unique ID
   * @apiName Get list participants of a game competition
   * @apiGroup Game Competition
   * @apiUse apiSecurity
   * @apiUse apiDefaultResponse
   * @apiPermission GameCompetitionPerms.OWNER
   *
   * @apiSuccess (200 Ok) {Number} statusCode status code
   * @apiSuccess (200 Ok) {String} Response Description
   * @apiSuccess (200 Ok) {User[]} data response data
   *
   * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token
   * @apiError (Error 4xx) 404-NotFound Game Competition not found/User not found
   * @apiUse apiError
   *
   */

  @Get('/participants/:id')
  @SecureRouteWithPerms()
  async getListParticipants(@Param('id', ObjectIDValidationPipe) id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'List of participants of a competition game',
      data: await this.competitionGameService.getListCompetitionParticipants(
        id,
      ),
    };
  }
}
