import { Body, Controller, Get, HttpStatus, Param, Put } from "@nestjs/common";
import { CompetitionGameService, GameWinnerCriteriaService } from "../services";
import { ApplyGameWriteriaToGammeDTO } from "../dtos";

@Controller("winner-criteria")
export class GameWinnerCriteriaController
{
    constructor(
        private winnerCriteriaService:GameWinnerCriteriaService,
        private competitionService:CompetitionGameService
    ){}


     /**
     * @api {get} /winner-criteria List of winning criteria 
     * @apidescription List of winning criteria
     * @apiName List of winning criteria
     * @apiGroup Game Winner Criteria
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
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Get()
    async getAllCriteria()
    {
        return {
            statusCode:HttpStatus.OK,
            message:`List of all winning criteria`,
            data:await this.winnerCriteriaService.findAll()
        }
    }

     /**
     * @api {get} /winner-criteria/:competitionID  get list of winning criteria by competition ID
     * @apidescription get list of winning criteria by competition ID
     * @apiName get list of winning criteria by competition ID
     * @apiParam {String} id Game competition unique ID
     * @apiGroup Game Winner Criteria
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
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Get(":competitionID")
    async getCriterialByCompetitionID(@Param("competitionID") gameCompetitionID:String)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"Get List of winner criterial by competitionID",
            data:(await this.competitionService.findOneByField({"_id":gameCompetitionID})).gameWinnerCriterias
        }
        
    }

    
}