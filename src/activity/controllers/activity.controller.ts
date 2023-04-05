import { Controller,HttpStatus, DefaultValuePipe, Get, Param, ParseIntPipe, Query,Req } from "@nestjs/common";
import { Request } from "express"
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { ActivityService } from "../services";

@SecureRouteWithPerms()
@Controller("user/history")
export class ActivityController
{
    constructor(private activityService:ActivityService){}
    
    /**
     * @api {get} /user/historry/:id/:page/:limit Get history activity
     * @apidescription Get history activity of user by user id, page number and limit of page
     * @apiParam {String} id Users unique ID
     * @apiParam {Number} page Page number
     * @apiParam {Number}  limit Maximum number of elements loaded
     * @apiName User action history
     * @apiGroup History Activity
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data.owner User id
     * @apiSuccess (200 Ok) {String} data.description Activity Descrition
     * @apiSuccess (200 Ok) {Boolean} data.hasError Specify whether the activity had an error during processing or not
     * @apiSuccess (200 Ok) {Object} data.otherProps Other activity property
     * @apiSuccess (200 Ok) {Date} data.createdAt Activity backup date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get(":id/:page/:limit")
    async getUserHistory(
        @Param("id",ObjectIDValidationPipe) id:string,
        @Param("page",new DefaultValuePipe(0), ParseIntPipe) page:number,
        @Param("limit",new DefaultValuePipe(10),ParseIntPipe) limit:number,
        @Req() request:Request    
    )
    {
        let data=await this.activityService.getActivityByPagination(request.user["userId"],page,limit);
        return {
            statusCode:HttpStatus.OK,
            message:`Page ${page} User Action History`,
            data
        }
    }
}