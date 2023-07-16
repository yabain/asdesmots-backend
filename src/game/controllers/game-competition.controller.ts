import { Body, Controller, Get, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { CreateCompetitionGameDTO, UpdateGameCompetitionGameDTO } from "../dtos";
import { GameCompetitionPerms } from "../enum";
import { CompetitionGameService } from "../services";

@Controller("game-competition")
export class GameCompetitionController
{
    constructor(
        private competitionGameService:CompetitionGameService
    ){}

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
     * @apiSuccess (201 Created) {Number} level level of games
     * @apiSuccess (201 Created) {Boolean} isSinglePart It's set to true if it's a one-party competition
     * @apiSuccess (201 Created) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
     * @apiSuccess (201 Created) {String} localisation  competition location area
     * @apiSuccess (201 Created) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
     * @apiSuccess (201 Created) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
     * @apiSuccess (201 Created) {Date} startDate game start date
     * @apiSuccess (201 Created) {Date} endDate game end date
     * @apiSuccess (201 Created) {Number} maxOfWinners  Maximum number of winners per competition
     * @apiSuccess (201 Created) {String} lang Language of the competition. it can be "en" for English and "fr" for French
     * @apiSuccess (201 Created) {String} [parentCompetition] In case it is a sub competition, this value represents the parent competition
     * @apiSuccess (201 Created) {String[]} gameWinnerCriterias competition winning criteria ID table
     * @apiSuccess (201 Created) {String[]} gameJudgesID competition judge ID 
     * @apiSuccess (201 Created) {CreateGamePartDTO[]} gameJudges competition judges ID table
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Post(":gameArcardeID")
    @SecureRouteWithPerms(
        // GameCompetitionPerms.CREATE
    )
    async create(@Body() createCompetitionGameDTO:CreateCompetitionGameDTO, @Param("gameArcardeID",ObjectIDValidationPipe) gameArcardeID:string)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game competition Created",
            data:await this.competitionGameService.createNewCompetition(createCompetitionGameDTO,gameArcardeID)
        }
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
     * @apiSuccess (200 Ok) {Number} level level of games
     * @apiSuccess (200 Ok) {Boolean} isSinglePart It's set to true if it's a one-party competition
     * @apiSuccess (200 Ok) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
     * @apiSuccess (200 Ok) {String} localisation  competition location area
     * @apiSuccess (200 Ok) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
     * @apiSuccess (200 Ok) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
     * @apiSuccess (200 Ok) {Date} startDate game start date
     * @apiSuccess (200 Ok) {Date} endDate game end date
     * @apiSuccess (200 Ok) {Number} maxOfWinners  Maximum number of winners per competition
     * @apiSuccess (200 Ok) {String} lang Language of the competition. it can be "en" for English and "fr" for French
     * @apiSuccess (200 Ok) {String} [parentCompetition] In case it is a sub competition, this value represents the parent competition
     * @apiSuccess (200 Ok) {String[]} gameWinnerCriterias competition winning criteria ID table
     * @apiSuccess (200 Ok) {String} gameJudgeID competition judge ID 
     * @apiSuccess (200 Ok) {CreateGamePartDTO[]} gameJudges competition judges ID table
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Put(":id")
    @SecureRouteWithPerms()
    async updateGameCompetition(@Body() updateGameCompetitionDTO:UpdateGameCompetitionGameDTO, @Param("id",ObjectIDValidationPipe) gameCompetitionID:String)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"Game competition updated",
            data:await this.competitionGameService.updateCompetition(updateGameCompetitionDTO, gameCompetitionID)
        }
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
     * @apiSuccess (200 Ok) {Number} level level of games
     * @apiSuccess (200 Ok) {Boolean} isSinglePart It's set to true if it's a one-party competition
     * @apiSuccess (200 Ok) {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
     * @apiSuccess (200 Ok) {String} localisation  competition location area
     * @apiSuccess (200 Ok) {Number} maxPlayerLife  Maximum number of lives of a player in the competition
     * @apiSuccess (200 Ok) {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
     * @apiSuccess (200 Ok) {Date} startDate game start date
     * @apiSuccess (200 Ok) {Date} endDate game end date
     * @apiSuccess (200 Ok) {Number} maxOfWinners  Maximum number of winners per competition
     * @apiSuccess (200 Ok) {String} lang Language of the competition. it can be "en" for English and "fr" for French
     * @apiSuccess (200 Ok) {String} [parentCompetition] In case it is a sub competition, this value represents the parent competition
     * @apiSuccess (200 Ok) {String[]} gameWinnerCriterias competition winning criteria ID table
     * @apiSuccess (200 Ok) {String} gameJudgeID competition judge ID 
     * @apiSuccess (200 Ok) {GamePart[]} gameParts competition judges ID table
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Get(":id")
    @SecureRouteWithPerms()
    async getGameCompetitionById(@Param("id",ObjectIDValidationPipe) id:string)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"Game competition details",
            data:await this.competitionGameService.findOneByField({"_id":id})
        }
    }
}