import { Controller, Post,Get, Body, HttpStatus, Delete, Param, NotFoundException, Put } from "@nestjs/common";
import { SecureRouteWithPerms } from "src/shared/security";
import { GameLevelPerms } from "../enums";
import { GameLevelService, WordGameLevelService } from "../services";
import { CreateGameLevelDTO, UpdateGameLevelDTO } from "./../dtos"
import { ObjectIDValidationPipe } from "src/shared/pipes";

@Controller("gamelevel")
export class GameLevelController
{
    constructor( 
        private wordGameLevelService:WordGameLevelService,
        private gameLevelService:GameLevelService){}

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
        let gamesLevel = await this.gameLevelService.findAll()
        return {
            statusCode:HttpStatus.OK,
            message:'List of game levels',
            data: gamesLevel.map((gameLevel)=>{
                let glevel= {...gameLevel.toJSON(),words: gameLevel.words}
                return glevel;
            })
        }
    }

    /**
     * @api {delete} /gamelevel/:gamelevelID/transfertLevelID Delete game level by id 
     * @apidescription Delete game level by id and transfert word with another level
     * @apiName Delete game level by id and tranfert word
     * @apiParam {String} gamelevelID game level id
     * @apiParam {String} transfertLevelID game level id
     * @apiGroup Game Level
     * @apiPermission GameLevelPerms.DELETE
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Delete(":gamelevelID/:transfertLevelID")
    @SecureRouteWithPerms()
    async deleteGameLevelList(@Param("gamelevelID",ObjectIDValidationPipe) gamelevelID:string,
                              @Param("transfertLevelID", ObjectIDValidationPipe) transfertLevelID:string)
    {
        let gameLevel = await this.gameLevelService.findOneByField({"_id":gamelevelID});
        if(!gameLevel) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })

        let transfertLevel = await this.gameLevelService.findOneByField({"_id":transfertLevelID});
        if(!transfertLevel) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })

        
        await this.gameLevelService.executeWithTransaction(async (session)=>{
            
            let gameL = await gameLevel.words.map((word) => {return word});
            console.log('new gameL :', gameL);
            transfertLevel.words = [...gameL];
            console.log('new Level transfert w table :', transfertLevel);
            await transfertLevel.save({session});
            return this.gameLevelService.delete({_id:gamelevelID},session)
        })
        
        return {
            statusCode: HttpStatus.OK,
            message:'Game of words deleted successfully'
        }
    }

    /**
     * @api {delete} /gamelevel/:gamelevelID Delete game level by id
     * @apidescription Delete game level who does not have words by id
     * @apiName Delete game level by id
     * @apiParam {String} gamelevelID game level id
     * @apiGroup Game Level
     * @apiPermission GameLevelPerms.DELETE
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
    */
    @Delete(":gamelevelID")
    @SecureRouteWithPerms()
    async deleteGameLevelListWithAnyWord(@Param("gamelevelID",ObjectIDValidationPipe) gamelevelID:string)
    {
        let gameLevel = await this.gameLevelService.findOneByField({"_id":gamelevelID});
        if(!gameLevel) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })

        await this.gameLevelService.executeWithTransaction(async (session)=>{
            return this.gameLevelService.delete({_id:gamelevelID},session)
        })
        
        return {
            statusCode: HttpStatus.OK,
            message:'Game of words deleted successfully'
        }
    }

    /**
     * @api {put} /gamelevel/:gamelevelID Game level update
     * @apidescription Updating game level by id
     * @apiParam {String} gamelevelID game level id
     * @apiName Game level update
     * @apiGroup Game Level
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Put("/gamelevel/:gamelevelID")
    @SecureRouteWithPerms(
        // WordGameLevelPerms.READ_ALL
    )
    async updateWordGameLevelList(@Param("gamelevelID",ObjectIDValidationPipe) gamelevelID:string,@Body() updateGameLevel:UpdateGameLevelDTO)
    {
        let gameLevel = await this.gameLevelService.findOneByField({_id:gamelevelID})
        if(!gameLevel) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })
       
        await gameLevel.update(updateGameLevel)
        return {
            statusCode:HttpStatus.OK,
            message:'Game level update completed successfully'
        }
    }
}