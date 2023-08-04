import { Body, Controller, Delete, Get, HttpStatus, Param, Post } from "@nestjs/common";
import { CreateGamePartDTO } from "../dtos";
import { GamePartService } from "../services";

@Controller("game-part")
export class GamePartController
{
    constructor(private gamePartService:GamePartService){}

    /**
     * 
     * @api {post} /game-part create new game part
     * @apiDescription create new game part. 
     * @apiName Create game part
     * @apiGroup Game Part
     * @apiUse apiSecurity
     * @apiUse apiDefaultResponse
     * @apiUse CreateGamePartDTO
     * @apiPermission GamePartPerms.CREATE
     * 
     * @apiSuccess (201 Created) {Number} statusCode status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data.name Game part name
     * @apiSuccess (201 Created) {String} data.description Game part description
     * @apiSuccess (201 Created) {String} data.numberOfWord Game part description
     * @apiSuccess (201 Created) {Object} data.gameLevel level of games
     * @apiSuccess (201 Created) {String} data.gameLevel.name game level name
     * @apiSuccess (201 Created) {String} data.gameLevel.description game level description
     * @apiSuccess (201 Created) {Date} data.startDate game start date
     * @apiSuccess (201 Created) {Date} data.endDate game end date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Post()
    async createGamePart(@Body() createGamePartDTO:CreateGamePartDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game part Created",
            data:await this.gamePartService.createNewGamePart(createGamePartDTO)
        }
    }

    /**
     * @api {delete} /game-part/:competitionID/:gamePartID Deleting a part of the game
     * @apidescription Deleting a part of the game
     * @apiName Deleting a part of the game
     * @apiGroup Game Part
     * @apiParam {String} competitionID Game competition unique ID
     * @apiParam {String} gamePartID Game part unique ID
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Delete(":competitionID/:gamePartID")
    async removeGameWriteriaToGamme(@Param("competitionID") competitionID:String,@Param("gamePartID") gamePartID:String)
    {
        await this.gamePartService.deletGamePart(competitionID,gamePartID);
        return {
            statusCode:HttpStatus.OK,
            message:"Game part successfully deleted",
        }
    }


    /**
     * @api {get} /game-part/:competitionID List of games in a competition
     * @apidescription List of games in a competition
     * @apiName List of games in a competition
     * @apiGroup Game Part
     * @apiParam {String} competitionID Game competition unique ID
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data.name Game part name
     * @apiSuccess (200 Ok) {String} data.description Game part description
     * @apiSuccess (200 Ok) {String} data.numberOfWord Game part description
     * @apiSuccess (200 Ok) {Object} data.gameLevel level of games
     * @apiSuccess (200 Ok) {String} data.gameLevel.name game level name
     * @apiSuccess (200 Ok) {String} data.gameLevel.description game level description
     * @apiSuccess (200 Ok) {Date} data.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.endDate game end date
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Get(":competitionID")
    async getListOfPartByCompetitionID(@Param("competitionID") competitionID:String)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"List of games in a competition",
            data: await this.gamePartService.getListOfPartOfCompetition(competitionID)
        }
    }
}