import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { UserJwtAuthGuard } from "src/user/guards";
import { CreateSubscriptionDTO } from "../dtos";
import { SubscriptionService } from "../services";

@SecureRouteWithPerms()
@Controller("subscription")
export class SubscriptionController
{
    constructor(private subscriptionService:SubscriptionService){}

    /**
     * @api {post} /subscription User subscription to a game
     * @apiDescription loggin User subscription to a game
     * @apiName New subscription
     * @apiGroup Subscription
     * @apiUse CreateSubscriptionDTO
     * 
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data._id Subscription id
     * @apiSuccess (201 Created) {String} data.owner Information on the subscribing player
     * @apiSuccess (201 Created) {String} data.game Game Information
     * @apiSuccess (201 Created) {String} data.period Subscription period
     * @apiSuccess (201 Created) {String} data.createAt Subscription creation date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Post()
    async addSubscription(@Body() createSubscriptionDTO:CreateSubscriptionDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Subscription to the game successful",
            data: await this.subscriptionService.createNewSubscription(createSubscriptionDTO)
        }
    }

    /**
     * @api {delete} /subscription/:id Unsubscribe a user from a game
     * @apidescription unsubscribe a user from a game
     * @apiParam {String} id Subscription ID
     * @apiName Unsubscribe
     * @apiGroup Subscription
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Delete(":id")
    async removeSubscription(@Param("id",ObjectIDValidationPipe) id:String)
    {
        await this.subscriptionService.removeSubscription(id);
        return {
            statusCode:HttpStatus.OK,
            message:"Subscription deleted with success"
        }
    }

    /**
     * @api {get} /subscription/user/:id Search for subscriptions of a user from his id
     * @apidescription Search for subscriptions of a user from his id
     * @apiParam {String} id User ID
     * @apiName Get a user's subscription list by id
     * @apiGroup Subscription
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data._id Subscription id
     * @apiSuccess (200 Ok) {String} data.owner Information on the subscribing player
     * @apiSuccess (200 Ok) {String} data.game Game Information
     * @apiSuccess (200 Ok) {String} data.period Subscription period
     * @apiSuccess (200 Ok) {String} data.createAt Subscription creation date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get("user/:id")
    async getSubscriptionByUser(@Param("id", ObjectIDValidationPipe) id:String)
    {
        
        return {
            statusCode:HttpStatus.OK,
            message:"Subscription per user successfully obtained",
            data:await this.subscriptionService.findOneByField({owner: id})
        }
    }

    /**
     * @api {get} /subscription/:id Get subscription by id
     * @apidescription Get subscription by id
     * @apiParam {String} id Subscription ID
     * @apiName Get subscription by id
     * @apiGroup Subscription
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data._id Subscription id
     * @apiSuccess (200 Ok) {String} data.owner Information on the subscribing player
     * @apiSuccess (200 Ok) {String} data.game Game Information
     * @apiSuccess (200 Ok) {String} data.period Subscription period
     * @apiSuccess (200 Ok) {String} data.createAt Subscription creation date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get(":id")
    async getSubscriptionByID(@Param("id",ObjectIDValidationPipe) id:String)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"Subscription successfully obtained",
            data:await this.subscriptionService.findOneByField({owner: id})
        }
    }

    /**
     * @api {put} /subscription/:id Game subscription reminder
     * @apidescription Game subscription reminder.
     * @apiParam {String} id Subscription ID
     * @apiName Unsubscribe
     * @apiGroup Subscription
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Put(":id")
    async reminderForSubscription(@Param("id", ObjectIDValidationPipe) id:String)
    {
        await this.subscriptionService.reminderSubscription(id)

        return {
            statusCode:HttpStatus.OK,
            message:"Subscription relaunched successfully",
        }
    }

}