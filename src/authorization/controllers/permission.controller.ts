import { Controller, Get, HttpStatus, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { UserJwtAuthGuard } from "src/user/guards";
import { PermissionsService } from "../services";

@SecureRouteWithPerms()
@Controller("perms")
export class PermissionController
{
    constructor( private permissionService:PermissionsService)
    {}

     /**
     * @api {get} /perms/ Permission list
     * @apidescription Get list of all permissions
     * @apiName Get permission list
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data._id Permission id
     * @apiSuccess (200 Ok) {String} data.permission.name Permission name
     * @apiSuccess (200 Ok) {String} data.permission.description Permission description
     * @apiSuccess (200 Ok) {String} data.permission.name Permission name
     * @apiSuccess (200 Ok) {String} data.permission.modules Module in which the permission applies
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */

    @Get()
    async getPerms()
    {
        return {
            statusCode:HttpStatus.OK,
            message:"List of permissions",
            data:await this.permissionService.findAll()
        }
    }

    /**
     * @api {get} /perms/:id Get permission by id
     * @apidescription Get permission by id
     * @apiParam {String} id User unique ID
     * @apiName Get permission by id
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data.permission._id Permission id
     * @apiSuccess (200 Ok) {String} data.permission.name Permission name
     * @apiSuccess (200 Ok) {String} data.permission.description Permission description
     * @apiSuccess (200 Ok) {String} data.permission.name Permission name
     * @apiSuccess (200 Ok) {String} data.permission.modules Module in which the permission applies
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get(":id")
    async getPerm(@Param('id',ObjectIDValidationPipe) id:string)
    {
        let data = await this.permissionService.findOneByField({"_id":id})
        if(!data) throw new NotFoundException({
            statusCode: 404,
            error:"NotFound",
            message:["Permission not found"]
        })
        return {
            statusCode:HttpStatus.OK,
            message:"Permission details",
            data
        }
    }
}