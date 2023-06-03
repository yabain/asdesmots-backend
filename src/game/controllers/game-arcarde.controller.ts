import { Body, Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { Delete, Param } from "@nestjs/common/decorators";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { PlayerSubscriptionDTO, CreateGameArcardeDTO } from "../dtos";
import { GameArcardePerms } from "../enum";
import { GameArcardeService } from "../services";
import { GameSubscriptionService } from "../services/game-subscription.service";

@Controller("game-arcarde")
export class GameArcardeController
{
    constructor(
        private gameArcardeService:GameArcardeService,
        private gameSubscriptionService:GameSubscriptionService
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
    async create(@Body() createGameArcardeDTO:CreateGameArcardeDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game arcarde Created",
            data:await this.gameArcardeService.create(createGameArcardeDTO)
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
     * @apiUse PlayerSubscriptionDTO
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
    @Delete("subscription")
    async removeSubscription(@Body() addSubscriptionDTO:PlayerSubscriptionDTO)
    {
        await this.gameSubscriptionService.removeGameArcardeSubscription(addSubscriptionDTO)
        return {
            statusCode:HttpStatus.OK,
            message:"user unregistration with success"
        }
    }
}