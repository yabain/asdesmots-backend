import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ObjectIDValidationPipe } from "src/shared/pipes";
import { SecureRouteWithPerms } from "src/shared/security";
import { UserJwtAuthGuard } from "src/user/guards";
import { UsersService } from "src/user/services";
import { AssignPermissionRoleDTO, AssignUserRoleDTO, CreateRoleDTO } from "../dtos";
import { RolesService } from "../services";

@SecureRouteWithPerms()
@Controller("roles")
export class RoleController
{
    constructor( private roleService:RolesService,private userService:UsersService)
    {}

    /**
     * 
     * @api {post} /roles create new role
     * @apiDescription create new role
     * @apiName Create role
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiUse apiDefaultResponse
     * @apiUse CreateRoleDTO
     * 
     * @apiSuccess (201 Created) {Number} statusCode status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data.name Role name
     * @apiSuccess (201 Created) {String} data.description Role description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Post()
    async createNewRole(@Body() createNewRoleDTO:CreateRoleDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Role Created",
            data: await this.roleService.create(createNewRoleDTO)
        }
    }


    /**
     * @api {get} /roles/:roleID/users get list of users by roleId
     * @apidescription get list of users by roleId
     * @apiParam {String} roleID role unique ID
     * @apiName get list of users by roleId
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {Object} data.user Users information
     * @apiSuccess (200 Ok) {String} data.user._id User id
     * @apiSuccess (200 Ok) {String} data.user.firstName User firstname
     * @apiSuccess (200 Ok) {String} data.user.lastName User lastname
     * @apiSuccess (200 Ok) {String} data.user.email User email
     * @apiSuccess (200 Ok) {Boolean} data.user.emailConfirmed is it a valid user account?
     * @apiSuccess (200 Ok) {String} data.user.profilPicture user picture profile
     * @apiSuccess (200 Ok) {String} data.user.country user country
     * @apiSuccess (200 Ok) {String} data.user.location user location
     * @apiSuccess (200 Ok) {String} data.user.permissions user permission
     * @apiSuccess (200 Ok) {String} data.user.createAt Account creation date
     * @apiSuccess (200 Ok) {String} data.user.userSetting Account settings
     * @apiSuccess (200 Ok) {String} data.user.userSetting.language Account language
     * @apiSuccess (200 Ok) {String} data.user.userSetting.theme Account theme
     * @apiSuccess (200 Ok) {String} data.user.userSetting.currency Account currency
     * @apiSuccess (200 Ok) {String} data.user.userSetting.isEnglishTimeFormatFor accounts whose date respects the English format
     * @apiSuccess (200 Ok) {String} data.user.createAt Account creation date
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @SecureRouteWithPerms()
    @Get(':roleID/users')
    async getListOfUserByRoleId(@Param('roleID',ObjectIDValidationPipe) roleId:string)
    {        
        return {
            statusCode:HttpStatus.OK,
            message:"List of users by role",
            data:await this.userService.findByField({
                    'roles':{$in:{"_id":roleId}}
                })
        }
    }


    /**
     * 
     * @api {delete} /roles/:roleId delete role
     * @apiDescription delete  role
     * @apiParam {String} roleId role unique ID
     * @apiName Delete role
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiUse apiDefaultResponse
     * @apiUse CreateRoleDTO
     * 
     * @apiSuccess (201 Created) {Number} statusCode status code
     * @apiSuccess (201 Created) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Delete(":roleId")
    async deleteRole(@Param('roleId',ObjectIDValidationPipe) roleId:string)
    {
        return {
            statusCode:HttpStatus.OK,
            message:"List of roles",
            data:await this.roleService.deleteRole(roleId)
        }
    }

     /**
     * @api {get} /roles/ Role list
     * @apidescription Get list of all roles
     * @apiName Get roles list
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data.role._id Role id
     * @apiSuccess (200 Ok) {String} data.role.name role name
     * @apiSuccess (200 Ok) {String} data.role.description Role description
     * @apiSuccess (200 Ok) {String} data.role.name Role name
     * @apiSuccess (200 Ok) {Array}  data.role.permissions List of role permissions
     * @apiSuccess (200 Ok) {String} data.role.permissions._id Permission id
     * @apiSuccess (200 Ok) {String} data.role.permissions.name Permission name
     * @apiSuccess (200 Ok) {String} data.role.permissions.description Permission description
     * @apiSuccess (200 Ok) {String} data.role.permissions.name Permission name
     * @apiSuccess (200 Ok) {String} data.role.permissions.modules Module in which the permission applies
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get()
    async getRoles()
    {
        return {
            statusCode:HttpStatus.OK,
            message:"List of roles",
            data:await this.roleService.findAll()
        }
    }

    /**
     * @api {get} /roles/user/:id Lists of roles by user ID
     * @apidescription Lists of roles by user ID
     * @apiParam {String} id User unique ID
     * @apiName Lists of roles by user ID
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Array} data response data
     * @apiSuccess (200 Ok) {String} data.role._id Role id
     * @apiSuccess (200 Ok) {String} data.role.name role name
     * @apiSuccess (200 Ok) {String} data.role.description Role description
     * @apiSuccess (200 Ok) {String} data.role.name Role name
     * @apiSuccess (200 Ok) {Array}  data.role.permissions List of role permissions
     * @apiSuccess (200 Ok) {String} data.role.permissions._id Permission id
     * @apiSuccess (200 Ok) {String} data.role.permissions.name Permission name
     * @apiSuccess (200 Ok) {String} data.role.permissions.description Permission description
     * @apiSuccess (200 Ok) {String} data.role.permissions.name Permission name
     * @apiSuccess (200 Ok) {String} data.role.permissions.modules Module in which the permission applies
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get("user/:userId")
    async getUserRole(@Param('userId',ObjectIDValidationPipe) userId:string)
    {
        let data = await this.userService.findOneByField({"_id":userId},{roles:1})
        if(!data) throw new NotFoundException({
            statusCode: 404,
            error:"NotFound",
            message:["Role not found"]
        })
        return {
            statusCode:HttpStatus.OK,
            message:"user roles list",
            data
        }
    }


    /**
     * @api {get} /roles/:id Lists of permissions by role ID
     * @apidescription Lists of permissions by role ID
     * @apiParam {String} id Role unique ID
     * @apiName Lists of permissions by role ID
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (200 Ok) {Number} statusCode HTTP status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiSuccess (200 Ok) {Object} data response data
     * @apiSuccess (200 Ok) {String} data.role._id Role id
     * @apiSuccess (200 Ok) {String} data.role.name role name
     * @apiSuccess (200 Ok) {String} data.role.description Role description
     * @apiSuccess (200 Ok) {String} data.role.name Role name
     * @apiSuccess (200 Ok) {Array}  data.role.permissions List of role permissions
     * @apiSuccess (200 Ok) {String} data.role.permissions._id Permission id
     * @apiSuccess (200 Ok) {String} data.role.permissions.name Permission name
     * @apiSuccess (200 Ok) {String} data.role.permissions.description Permission description
     * @apiSuccess (200 Ok) {String} data.role.permissions.name Permission name
     * @apiSuccess (200 Ok) {String} data.role.permissions.modules Module in which the permission applies
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Get(":id")
    async getPerm(@Param('id',ObjectIDValidationPipe) id:string)
    {
        let data = await this.roleService.findOneByField({"_id":id})
        if(!data) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Role not found"]
        })
        return {
            statusCode:HttpStatus.OK,
            message:"Role details",
            data
        }
    }


    /**
     * @api {post} /roles/add-user Add a list of role to a user
     * @apidescription Add a list role to a user
     * @apiName AddRoleToUser
     * @apiGroup Authorization
     * @apiUse AddRoleUserDTO
     * @apiUse apiSecurity
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Post("add-user")
    async addRoleToUser(@Body() addRoleToUserDTO:AssignUserRoleDTO)
    {
        await this.roleService.addRoleToUser(addRoleToUserDTO);

        return {
            statusCode:HttpStatus.CREATED,
            message:"Assign role to user successfully"
        }
    }

    /**
     * @api {put} /roles/update-role/:roleID Update a role by Id 
     * @apidescription Update a role by Id 
     * @apiName UpdateRole
     * @apiGroup Authorization
     * @apiUse CreateRoleDTO
     * @apiParam {String} id Role unique ID
     * @apiSuccess (200 OK) {Number} statusCode HTTP status code
     * @apiSuccess (200 OK) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound Role not found
     * @apiUse apiError

     */
    @Put("update-role/:roleID")
    async updateRole(
        @Param('roleID', ObjectIDValidationPipe) roleID: string,
        @Body() updateRoleDTO: CreateRoleDTO
    ) 
    {
        let role = this.roleService.findOneByField({"_id": roleID})
        if (!role) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error: 'role Error',
            message: ["role not found"]
        });

        (await role).update(updateRoleDTO)
        return {
            statusCode:HttpStatus.OK,
            message:'Role update completed successfully'
        }
    }

    /**
     * @api {post} /roles/add-perm Add a permission to a role
     * @apidescription Add a permission to a role
     * @apiName AddPermToRole
     * @apiGroup AssignPermissionRoleDTO
     * @apiGroup Authorization
     * @apiUse AssignPermissionRoleDTO
     * @apiUse apiSecurity
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Post("add-perm")
    async addPermissionToRole(@Body() addPermissionToRole:AssignPermissionRoleDTO)
    {
        await this.roleService.assignPermissionToRole(addPermissionToRole);

        return {
            statusCode:HttpStatus.CREATED,
            message:"Assign permission to role successfully"
        }
    }

    /**
     * @api {delete} /roles/remove-user/userId/roleId Remove a role to a user
     * @apidescription Add a role to a user
     * @apiName RemoveRoleToUser
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Delete("remove-user/:userId/:roleId")
    async removeRoleToUser(
        @Param('userId', ObjectIDValidationPipe) userId: string,
        @Param('roleId', ObjectIDValidationPipe) roleId: string
    )
    {
        const objectReceiveFromFrontend = {
            userId: userId,
            roleId: roleId
        }

        await this.roleService.removeRoleToUser(objectReceiveFromFrontend)
        return {
            statusCode:HttpStatus.CREATED,
            message:"Remove role to user successfully"
        }
    }

    /**
     * @api {delete} /roles/remove-perm Remove permission from a role
     * @apidescription Remove permission from a role
     * @apiName RemovePermToRole
     * @apiUse AssignPermissionRoleDTO
     * @apiGroup Authorization
     * @apiUse apiSecurity
     * @apiSuccess (201 Created) {Number} statusCode HTTP status code
     * @apiSuccess (201 Created) {String} Response Description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiUse apiError
     */
    @Post("remove-perm")
    async removePermissionToRole(@Body() addPermissionToRole:AssignPermissionRoleDTO)
    {
        await this.roleService.removePermissionToRole(addPermissionToRole);
        return {
            statusCode:HttpStatus.CREATED,
            message:"Remove permissionto role successfully",
        }
    }
}