import { Body, Controller, DefaultValuePipe, Get, HttpStatus, ParseIntPipe, Post } from "@nestjs/common";
import { Delete, Param, Req } from "@nestjs/common/decorators";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { PlayerSubscriptionDTO, CreateGameArcardeDTO, PlayerUnSubscriptionDTO } from "../dtos";
import { GameArcardePerms } from "../enum";
import { CompetitionGameService, GameArcardeService } from "../services";
import { GameSubscriptionService } from "../services/game-subscription.service";
import { Request } from "express";
import { UsersService } from "src/user/services";

@Controller("game-arcarde")
export class GameArcardeController
{
    constructor(
        private gameArcardeService:GameArcardeService,
        private gameSubscriptionService:GameSubscriptionService,
        private gameCompetitionService:CompetitionGameService,
        private usersService:UsersService
        ){}

    /**
     * 
     * @api {post} /game-arcarde create new game arcarde
     * @apiDescription create new game arcard
     * @apiName Create game arcarde
     * @apiGroup Game Arcarde
     * @apiUse apiSecurity
     * @apiUse apiDefaultResponse
     * @apiUse CreateGameArcardeDTO
     * @apiPermission GameArcardePerms.CREATE
     * 
     * @apiSuccess (201 Created) {Number} statusCode status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data.name Game arcarde name
     * @apiSuccess (201 Created) {String} data.description Game arcarde description
     * @apiSuccess (201 Created) {Boolean} data.isOnlineGame is set to true if the game is online and false otherwise
     * @apiSuccess (201 Created) {Boolean} data.canRegisterPlayer Is set to true if players can register or not
     * @apiSuccess (201 Created) {Boolean} data.isFreeRegistrationPlayer Is set to true if the participation in the games is free or not
     * @apiSuccess (201 Created) {Number} data.maxPlayersNumber  Maximum number of player
     * @apiSuccess (201 Created) {Date} data.startDate game start date
     * @apiSuccess (201 Created) {Date} data.endDate game end date
     * @apiSuccess (201 Created) {Date} data.startRegistrationDate game registration start date
     * @apiSuccess (201 Created) {Date} data.endRegistrationDate game registration end date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Post()
    @SecureRouteWithPerms(
        // GameArcardePerms.CREATE
    )
    async create(@Body() createGameArcardeDTO:CreateGameArcardeDTO,@Req()request:Request)
    {       
        let userConnected=await this.usersService.findOneByField({"email":request.user["email"]});
        
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game arcarde Created",
            data: await this.gameArcardeService.executeWithTransaction(async (session)=>{
                    let gameArcarde=await this.gameArcardeService.create({...createGameArcardeDTO,owner:userConnected},session);
        
                    await this.gameCompetitionService.createNewCompetition({
                        name:gameArcarde.name,
                        description:gameArcarde.description,
                        level:0,
                        isSinglePart:false,
                        canRegisterPlayer:createGameArcardeDTO.canRegisterPlayer,
                        localisation:"",
                        maxPlayerLife:0,
                        startDate:createGameArcardeDTO.startDate,
                        endDate:createGameArcardeDTO.endDate,
                        maxOfWinners:3
                    },gameArcarde.id,session,gameArcarde);
                    return gameArcarde
                })
        }
    }

     /**
     * @api {get} /game-arcarde/ Obtaining the list of arcades of the logged in user
     * @apidescription Obtaining the list of arcades of the logged in user
     * @apiName get list of games arcarde 
     * @apiGroup Game Arcarde
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response Array
     * @apiSuccess (200 Ok) {String} data.name Game arcarde name
     * @apiSuccess (200 Ok) {String} data.description Game arcarde description
     * @apiSuccess (200 Ok) {Boolean} data.isOnlineGame is set to true if the game is online and false otherwise
     * @apiSuccess (200 Ok) {Boolean} data.canRegisterPlayer Is set to true if players can register or not
     * @apiSuccess (200 Ok) {Boolean} data.isFreeRegistrationPlayer Is set to true if the participation in the games is free or not
     * @apiSuccess (200 Ok) {Number} data.maxPlayersNumber  Maximum number of player
     * @apiSuccess (200 Ok) {Date} data.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.endDate game end date
     * @apiSuccess (200 Ok) {Date} data.startRegistrationDate game registration start date
     * @apiSuccess (200 Ok) {Date} data.endRegistrationDate game registration end date
     * @apiSuccess (200 Ok) {String} data.owner Arcade Creator ID
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
     @SecureRouteWithPerms()
     @Get()
     async getByAllArcardeByUser(@Req() request:Request)
     {
        let userConnected=await this.usersService.findOneByField({"email":request.user["email"]});
         return {
             statusCode:HttpStatus.OK,
             message:"List of arcade games of the connected user",
             data:await this.gameArcardeService.findByField({"owner":userConnected._id})
         }
     }
     

     

     /**
     * @api {get} /game-arcarde/list/:page/:limit Obtaining the list of arcades by pages and limits
     * @apidescription Obtaining the list of arcades by pages and limits. To have the list of all the arcades, the page and limit parameters must have the value: `-1`. and therefore the url must be `/game-arcarde/-1/-1`
     * @apiName get list of games arcarde by pages and limits
     * @apiGroup Game Arcarde
     * @apiParam {Number} page Page number; 
     * @apiParam {Number}  limit Maximum number of elements loaded
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response Array
     * @apiSuccess (200 Ok) {String} data.name Game arcarde name
     * @apiSuccess (200 Ok) {String} data.description Game arcarde description
     * @apiSuccess (200 Ok) {Boolean} data.isOnlineGame is set to true if the game is online and false otherwise
     * @apiSuccess (200 Ok) {Boolean} data.canRegisterPlayer Is set to true if players can register or not
     * @apiSuccess (200 Ok) {Boolean} data.isFreeRegistrationPlayer Is set to true if the participation in the games is free or not
     * @apiSuccess (200 Ok) {Number} data.maxPlayersNumber  Maximum number of player
     * @apiSuccess (200 Ok) {Date} data.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.endDate game end date
     * @apiSuccess (200 Ok) {Date} data.startRegistrationDate game registration start date
     * @apiSuccess (200 Ok) {Date} data.endRegistrationDate game registration end date
     * @apiSuccess (200 Ok) {String} data.owner Arcade Creator ID
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
     @SecureRouteWithPerms()
     @Get("list/:page/:limit")
     async getAllAcardeByPage(
        @Param("page",new DefaultValuePipe(-1), ParseIntPipe) page:number,
        @Param("limit",new DefaultValuePipe(10),ParseIntPipe) limit:number,
        @Req() request:Request)
     {
        let data=await this.gameArcardeService.getArcardeByPagination(page,limit);
        return {
            statusCode:HttpStatus.OK,
            message:`Page ${page} Game arcarde`,
            data
        }
     }

     /**
     * @api {get} /game-arcarde/:id/subscription Obtention de la liste des souscripteur a une arcarde
     * @apidescription Souscription d'un joueur a une arcarde
     * @apiName Souscription a un jeu
     * @apiGroup Game Arcarde
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data._id identifiant 
     * @apiSuccess (200 Ok) {Number} data.lifeGame nombre de vie du joueur
     * @apiSuccess (200 Ok) {Boolean} data.hasLostGame Est définis sur vrai si le joueur a déjà perdu la parti
     * @apiSuccess (200 Ok) {User} data.player Information sur le joueur. la strucuture de l'object est le même que celui d'un utilisateur
     * @apiSuccess (200 Ok) {String} data.localisation zone de localisation  du jeu
     * @apiSuccess (200 Ok) {Date} data.createdAt date e souscription du joueur a un jeu
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Get(":id/subscription")
    async getSubscription(@Param("id",ObjectIDValidationPipe) id:string)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Get list of game subscriptor",
            data:await this.gameArcardeService.getListArcardeSubscriptor(id)
        }
    }

     /**
     * @api {get} /game-arcarde/:id/localisation Obtain the list of locations of an arcade by its id
     * @apidescription Obtain the list of locations of an arcade by its id
     * @apiParam {String} id Game Arcarde unique ID
     * @apiName get location of game arcarde by ID 
     * @apiGroup Game Arcarde
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Get(":id/localisation")
    async getGameArcardeLocation(@Param("id",ObjectIDValidationPipe) id:string)
    {
       return {
           statusCode:HttpStatus.OK,
           message:`List of localisation game arcarde`,
           data: await this.gameArcardeService.getListArcardeLocation(id)
       }
    }

    /**
     * @api {get} /game-arcarde/:id Get game arcarde by id
     * @apidescription Get game arcarde details by id
     * @apiParam {String} id Game Arcarde unique ID
     * @apiName get game arcarde by ID 
     * @apiGroup Game Arcarde
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data.name Game arcarde name
     * @apiSuccess (200 Ok) {String} data.description Game arcarde description
     * @apiSuccess (200 Ok) {Boolean} data.isOnlineGame is set to true if the game is online and false otherwise
     * @apiSuccess (200 Ok) {Boolean} data.canRegisterPlayer Is set to true if players can register or not
     * @apiSuccess (200 Ok) {Boolean} data.isFreeRegistrationPlayer Is set to true if the participation in the games is free or not
     * @apiSuccess (200 Ok) {Number} data.maxPlayersNumber  Maximum number of player
     * @apiSuccess (200 Ok) {Date} data.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.endDate game end date
     * @apiSuccess (200 Ok) {Date} data.startRegistrationDate game registration start date
     * @apiSuccess (200 Ok) {Date} data.endRegistrationDate game registration end date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @SecureRouteWithPerms()
    @Get(":id")
    async getById(@Param("id",ObjectIDValidationPipe) id:string)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"Game arcarde by ID",
            data:await this.gameArcardeService.findOneByField({"_id":id})
        }
    }

    /**
     * @api {post} /game-arcarde/subscription Souscription d'un joueur a un jeu
     * @apidescription Souscription d'un joueur a un jeu
     * @apiName Souscription a un jeu
     * @apiGroup Game Arcarde
     * @apiUse PlayerSubscriptionDTO
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data._id identifiant 
     * @apiSuccess (200 Ok) {Number} data.lifeGame nombre de vie du joueur
     * @apiSuccess (200 Ok) {Boolean} data.hasLostGame Est définis sur vrai si le joueur a déjà perdu la parti
     * @apiSuccess (200 Ok) {User} data.player Information sur l'utilisateur
     * @apiSuccess (200 Ok) {String} data.localisation zone de localisation  du jeu
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Post("subscription")
    async addSubscription(@Body() addSubscriptionDTO:PlayerSubscriptionDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Successful registered user subscription",
            data:await this.gameSubscriptionService.addGameArcardeSubscription(addSubscriptionDTO)
        }
    }

    /**
     * @api {delete} /game-arcarde/subscription desenregistrement d'un joueur a un jeu
     * @apidescription Desenregistrement d'un joueur a un jeu
     * @apiName Desenregistrement a un jeu
     * @apiGroup Game Arcarde
     * @apiUse PlayerUnSubscriptionDTO
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Delete("subscription")
    async removeSubscription(@Body() addUnSubscriptionDTO:PlayerUnSubscriptionDTO)
    {
        await this.gameSubscriptionService.removeGameArcardeSubscription(addUnSubscriptionDTO)
        return {
            statusCode:HttpStatus.OK,
            message:"user unregistration with success"
        }
    }
}