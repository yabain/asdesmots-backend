import { Body, Controller, DefaultValuePipe, Get, HttpStatus, NotFoundException, ParseIntPipe, Post } from "@nestjs/common";
import { Delete, Param, Put, Req } from "@nestjs/common/decorators";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { PlayerSubscriptionDTO, CreateGameArcardeDTO, PlayerUnSubscriptionDTO, ChangeGameArcardeStateDTO } from "../dtos";
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
     * @apiDescription create new game arcarde. When creating a new arcade, a root competition with the same name is directly created and associated with the arcade. thus any other competition that will be created must be taken as a sub-competition (more or less of several levels) of this one
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
     * @apiSuccess (200 Ok) {String} data.owner Arcade Creator ID competitionGames
     * @apiSuccess (200 Ok) {Array} data.competitionGames Game competitions list
     * @apiSuccess (200 Ok) {String {4..65}} data.competitionGames.name Game competition name
     * @apiSuccess (200 Ok) {String {4..65}} data.competitionGames.description Game competition description
     * @apiSuccess (200 Ok) {Number} data.competitionGames.level level of games
     * @apiSuccess (200 Ok) {Boolean} data.competitionGames.isSinglePart It's set to true if it's a one-party competition
     * @apiSuccess (200 Ok) {Boolean} data.competitionGames.canRegisterPlayer is set to true if players can register for the competition
     * @apiSuccess (200 Ok) {String} data.competitionGames.localisation  competition location area
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxPlayerLife  Maximum number of lives of a player in the competition
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
     * @apiSuccess (200 Ok) {Date} data.competitionGames.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.competitionGames.endDate game end date
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxOfWinners  Maximum number of winners per competition
     * @apiSuccess (200 Ok) {String} data.competitionGames.lang Language of the competition. it can be "en" for English and "fr" for French
     * @apiSuccess (200 Ok) {String} data.competitionGames.parentCompetition In case it is a sub competition, this value represents the parent competition
     * @apiSuccess (200 Ok) {String[]} data.competitionGames.gameWinnerCriterias competition winning criteria ID table
     * @apiSuccess (200 Ok) {String[]} data.competitionGames.gameJudgesID competition judge ID 
     * @apiSuccess (200 Ok) {GamePart[]} data.competitionGames.gameJudges competition judges ID table
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
     * @api {put} /game-arcarde/state Changing the state of the arcarde. this allows you to start and end an arcade
     * @apidescription Changing the state of the arch. this allows you to start and end an arcade
     * @apiName Changing the state of the arcarde.
     * @apiGroup Game Arcarde
     * @apiUse ChangeGameArcardeStateDTO
     * @apiUse apiSecurity 
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
    
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Game Arcarde not found
     * @apiUse apiError
     */
     @SecureRouteWithPerms()
     @Put('/state')
     async changeArcardeState(@Body() changeGameStateDTO:ChangeGameArcardeStateDTO)
     {
        await this.gameArcardeService.changeGameArcarde(changeGameStateDTO);
        return {
            statusCode:HttpStatus.OK,
            message:"Update game Arcarde state",
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
     * @apiSuccess (200 Ok) {Array} data.competitionGames Game competitions list
     * @apiSuccess (200 Ok) {String {4..65}} data.competitionGames.name Game competition name
     * @apiSuccess (200 Ok) {String {4..65}} data.competitionGames.description Game competition description
     * @apiSuccess (200 Ok) {Number} data.competitionGames.level level of games
     * @apiSuccess (200 Ok) {Boolean} data.competitionGames.isSinglePart It's set to true if it's a one-party competition
     * @apiSuccess (200 Ok) {Boolean} data.competitionGames.canRegisterPlayer is set to true if players can register for the competition
     * @apiSuccess (200 Ok) {String} data.competitionGames.localisation  competition location area
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxPlayerLife  Maximum number of lives of a player in the competition
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
     * @apiSuccess (200 Ok) {Date} data.competitionGames.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.competitionGames.endDate game end date
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxOfWinners  Maximum number of winners per competition
     * @apiSuccess (200 Ok) {String} data.competitionGames.lang Language of the competition. it can be "en" for English and "fr" for French
     * @apiSuccess (200 Ok) {String} data.competitionGames.parentCompetition In case it is a sub competition, this value represents the parent competition
     * @apiSuccess (200 Ok) {String[]} data.competitionGames.gameWinnerCriterias competition winning criteria ID table
     * @apiSuccess (200 Ok) {String[]} data.competitionGames.gameJudgesID competition judge ID 
     * @apiSuccess (200 Ok) {GamePart[]} data.competitionGames.gameJudges competition judges ID table
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
     * @apidescription  Obtention de la liste des souscripteur a une arcarde
     * @apiName  Obtention de la liste des souscripteur a une arcarde
     * @apiParam {String} id Identifiant de l'arcarde 
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
     * @apiSuccess (200 Ok) {Array} data.competitionGames Game competitions list
     * @apiSuccess (200 Ok) {String {4..65}} data.competitionGames.name Game competition name
     * @apiSuccess (200 Ok) {String {4..65}} data.competitionGames.description Game competition description
     * @apiSuccess (200 Ok) {Number} data.competitionGames.level level of games
     * @apiSuccess (200 Ok) {Boolean} data.competitionGames.isSinglePart It's set to true if it's a one-party competition
     * @apiSuccess (200 Ok) {Boolean} data.competitionGames.canRegisterPlayer is set to true if players can register for the competition
     * @apiSuccess (200 Ok) {String} data.competitionGames.localisation  competition location area
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxPlayerLife  Maximum number of lives of a player in the competition
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
     * @apiSuccess (200 Ok) {Date} data.competitionGames.startDate game start date
     * @apiSuccess (200 Ok) {Date} data.competitionGames.endDate game end date
     * @apiSuccess (200 Ok) {Number} data.competitionGames.maxOfWinners  Maximum number of winners per competition
     * @apiSuccess (200 Ok) {String} data.competitionGames.lang Language of the competition. it can be "en" for English and "fr" for French
     * @apiSuccess (200 Ok) {String} data.competitionGames.parentCompetition In case it is a sub competition, this value represents the parent competition
     * @apiSuccess (200 Ok) {String[]} data.competitionGames.gameWinnerCriterias competition winning criteria ID table
     * @apiSuccess (200 Ok) {String[]} data.competitionGames.gameJudgesID competition judge ID 
     * @apiSuccess (200 Ok) {GamePart[]} data.competitionGames.gameJudges competition judges ID table
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