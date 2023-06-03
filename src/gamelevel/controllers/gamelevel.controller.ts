import { Controller, Post,Get, Body, HttpStatus } from "@nestjs/common";
import { SecureRouteWithPerms } from "src/shared/security";
import { GameLevelPerms } from "../enums";
import { GameLevelService } from "../services";
import { CreateGameLevelDTO } from "./../dtos"

@Controller("gamelevel")
export class GameLevelController
{
    constructor( private gameLevelService:GameLevelService){}

    /**
     * @api {post} /gamelevel New game level
     * @apiDescription Create a new game level
     * @apiName New game level
     * @apiGroup Game Level
     * @apiUse CreateGameLevelDTO
     * @apiPermission GameLevelPerms.CREATE
     * 
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data._id Game level id
     * @apiSuccess (201 Created) {String} data.name Game level name
     * @apiSuccess (201 Created) {String} data.description Game level description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Post()
    @SecureRouteWithPerms(
        // GameLevelPerms.CREATE
    )
    async createNewGameLevel(@Body() newGameLevel:CreateGameLevelDTO)
    {
        let data = await this.gameLevelService.create(newGameLevel);
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game level created successfully",
            data
        }
    }

    /**
     * @api {get} /gamelevel List of game levels
     * @apidescription Get the List of game levels
     * @apiName List of game levels
     * @apiGroup Game Level
     * @apiPermission GameLevelPerms.READ_ALL
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data._id Game level id
     * @apiSuccess (200 Ok) {String} data.name Game level name
     * @apiSuccess (200 Ok) {String} data.description Game level description
     * @apiSuccess (200 Ok) {Array} data.words List of level words
     * @apiSuccess (200 Ok) {String} data.words._id word id
     * @apiSuccess (200 Ok) {String} data.words.name word name
     * @apiSuccess (200 Ok) {String} data.words.description word description
     * @apiSuccess (200 Ok) {String} data.words.type Type of the word. it can have the value 'en' for English words and 'fr' for French words
     * 
     * 
     * @apiSuccess (200 Ok) {String} data.words.createAt Game level creation date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get()
    @SecureRouteWithPerms(
        // GameLevelPerms.READ_ALL
    )
    async getGameLevelList()
    {
        return {
            statusCode:HttpStatus.OK,
            message:'List of game levels',
            data: await this.gameLevelService.findAll()
        }
    }
}