import { Controller, Post,Get, Body, HttpStatus, Delete, Param, NotFoundException, Put, forwardRef, Inject } from "@nestjs/common";
import { SecureRouteWithPerms } from "src/shared/security";
import { GameLevelPerms } from "../enums";
import { GameLevelService, WordGameLevelService } from "../services";
import { CreateGameLevelDTO, UpdateGameLevelDTO, SortGameLevelDTO } from "./../dtos"
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { QueueService } from "src/queues/queue.service";

@Controller("gamelevel")
export class GameLevelController
{
    constructor( 
        @Inject(forwardRef(() => QueueService))
        private readonly queueService: QueueService,
        private wordGameLevelService:WordGameLevelService,
        private gameLevelService:GameLevelService,
    ) {}

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
     * @api {put} /gamelevel Game levels sort
     * @apidescription sort game levels
     * @apiParam {Array} gamelevels games levels
     * @apiName Game level sort
     * @apiGroup Game Level
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Put("/sort-list")
    async sortLevelList(@Body() sortGameLevelDTO:SortGameLevelDTO[])
    {
        for(let srtItem of sortGameLevelDTO) {
            // Get item's current level positions
            const changingElem = await this.gameLevelService.findOneByField({ _id: srtItem.id });
            
            // await this.gameLevelService.swapLevels(changingElem.level, srtItem.level);
            
            await this.queueService.addSwapJob(changingElem.level, srtItem.level);
        };
        return {
            statusCode:HttpStatus.OK,
            message:'Game level sorted successfully'
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
        let gamesLevel = await this.gameLevelService.findAll({level:1});
        let enLength = 0;
        let frLength = 0;
        return await {
            statusCode:HttpStatus.OK,
            message:'List of game levels',
            data: {
                levels: gamesLevel.map((gameLevel)=>{
                    let glevel= {
                        ...gameLevel.toJSON(),
                        words: gameLevel.words.map(word=>word.id)
                    };
                    enLength += gameLevel.words.filter(wrd => wrd.type === 'en').length;
                    frLength += gameLevel.words.filter(wrd => wrd.type === 'fr').length;
                    return glevel;
                }),
                enWordsLength: enLength,
                frWordsLength: frLength
            }
        }
    }

    /**
     * @api {delete} /gamelevel/:gamelevelID Delete game level by id
     * @apidescription Delete game level by id
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
    async deleteGameLevelList(@Param("gamelevelID",ObjectIDValidationPipe) gamelevelID:string)
    {
        let gameLevel = await this.gameLevelService.findOneByField({"_id":gamelevelID});
        if(!gameLevel) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })

        await this.gameLevelService.executeWithTransaction(async (session)=>{
            await Promise.all(gameLevel.words.map((word)=>this.wordGameLevelService.delete({"_id":word.id},session)));
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

    /**
     * @api {delete} /gamelevel/:fromLevelID/:toLevelID Delete game level by id
     * @apidescription Delete game level by id
     * @apiName Delete game level by id
     * @apiParam {String} fromLevelID game level id
     * @apiParam {String} toLevelID game level id
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
    @Delete(":fromLevelID/:toLevelID")
    @SecureRouteWithPerms()
    async transferWordsAndDeleteGameLevel(
        @Param("fromLevelID",ObjectIDValidationPipe) fromLevelID:string,
        @Param("toLevelID",ObjectIDValidationPipe) toLevelID:string
    ) {
        let fromLevel = await this.gameLevelService.findOneByField({"_id":fromLevelID});
        let toLevel = await this.gameLevelService.findOneByField({"_id":toLevelID});
        if(!(fromLevel || toLevel)) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["One or more game level not found"]
        })

        await this.gameLevelService.executeWithTransaction(async (session)=>{
            let toLevelWords = toLevel.words;
            await Promise.all(fromLevel.words.map((word)=>toLevelWords.push(word)));
            await this.gameLevelService.update({_id: toLevelID},{words:toLevelWords})
            return this.gameLevelService.delete({_id:fromLevel},session)
        })
        
        return {
            statusCode: HttpStatus.OK,
            message:'Game of words deleted successfully'
        }
    }
}