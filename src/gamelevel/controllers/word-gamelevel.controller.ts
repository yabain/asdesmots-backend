import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post } from "@nestjs/common";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { CreateWordGameLevelDTO } from "../dtos";
import { WordGameLevelPerms } from "../enums";
import { GameLevelService, WordGameLevelService } from "../services";

@Controller("gamelevel")
export class WordGameLevelController
{
    constructor(
        private wordGameLevelService:WordGameLevelService,
        private gameLevelService:GameLevelService
    ){}

     /**
     * @api {post} /gamelevel/word New word of a games level
     * @apiDescription Create a new word from a game level
     * @apiName New word of a games level
     * @apiGroup Game Level
     * @apiUse CreateWordGameLevelDTO
     * 
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data._id word id
     * @apiSuccess (201 Created) {String} data.name word name
     * @apiSuccess (201 Created) {String} data.description word description
     * @apiSuccess (201 Created) {String} data.type Type of the word. it can have the value 'en' for English words and 'fr' for French words
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
     @Post("word")
     @SecureRouteWithPerms(
        //  WordGameLevelPerms.CREATE
     )
     async createNewGameLevel(@Body() newGameLevel:CreateWordGameLevelDTO)
     {
         let data = await this.wordGameLevelService.newWordGameLevel(newGameLevel);
         return {
             statusCode:HttpStatus.CREATED,
             message:"Game level created successfully",
             data
         }
     }

     /**
     * @api {get} /gamelevel/:gamelevelID/words List of words in a game level
     * @apidescription Get the List of words in a game level
     * @apiParam {String} gamelevelID game level id
     * @apiName List of words in a game level by id
     * @apiGroup Game Level
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data._id word id
     * @apiSuccess (200 Ok) {String} data.name word name
     * @apiSuccess (200 Ok) {String} data.description word description
     * @apiSuccess (200 Ok) {String} data.type Type of the word. it can have the value 'en' for English words and 'fr' for French words
     * 
     * 
     * @apiSuccess (200 Ok) {String} data.createAt Game level creation date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get(":gamelevelID/words")
    @SecureRouteWithPerms(
        WordGameLevelPerms.READ_ALL
    )
    async getGameLevelList(@Param("id",ObjectIDValidationPipe) gamelevelID:string)
    {
        let data = await this.gameLevelService.findOneByField({_id:gamelevelID})
        if(!data) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })
        return {
            statusCode:HttpStatus.OK,
            message:'List of words in a game level',
            data: data.words
        }
    }

}