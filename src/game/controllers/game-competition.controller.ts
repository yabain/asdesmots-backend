import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { SecureRouteWithPerms } from "src/shared/security";
import { CreateCompetitionGameDTO } from "../dtos";
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
     * @api {post} /game-competition create new game competition
     * @apiDescription create new game competition
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
    @Post()
    @SecureRouteWithPerms(
        GameCompetitionPerms.CREATE
    )
    async create(@Body() createCompetitionGameDTO:CreateCompetitionGameDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game competition Created",
            data:await this.competitionGameService.createNewCompetition(createCompetitionGameDTO)
        }
    }
}