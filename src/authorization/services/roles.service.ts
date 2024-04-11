import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose";
import { Role, RoleDocument } from "../models";
import { DataBaseService } from "src/shared/services/database";
import { AssignPermissionRoleDTO, AssignUserRoleDTO } from "../dtos";
import { PermissionsService } from "./permissions.service";
import { UsersService } from "src/user/services";
import { session } from "passport";

@Injectable()
export class RolesService extends DataBaseService<RoleDocument>
{
    constructor(
        @InjectModel(Role.name) roleModel: Model<RoleDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private permissionService:PermissionsService,
        private usersService:UsersService
        ){
            super(roleModel,connection,["permissions"]);
    }  

    async assignPermissionToRole(addPermissionToRole:AssignPermissionRoleDTO)
    {
        let perm = await this.permissionService.findOneByField({"_id":addPermissionToRole.permissionId});
        if(!perm) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Permission Error',
            message:["Permission not found"]
          });
        let role = await this.findOneByField({"_id":addPermissionToRole.roleId});
        if(!role) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
          });

          role.permissions.push(perm);
          return role.save();

    }

    async removePermissionToRole(removePermissionToRole:AssignPermissionRoleDTO)
    {
        let perm = await this.permissionService.findOneByField({"_id":removePermissionToRole.permissionId});
        if(!perm) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Permission Error',
            message:["Permission not found"]
          });
        let role = await this.findOneByField({"_id":removePermissionToRole.roleId});
        if(!role) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
          });

        let index = role.permissions.findIndex((p)=>p.id==perm.id);
        if(index>-1) role.permissions.splice(index,1);

        return role.save();
    }

    async addRolesToUser(addRoleToUserDTO: AssignUserRoleDTO) {
      let user = await this.usersService.findOneByField({ "_id": addRoleToUserDTO.userId });
      if (!user) throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Role Error',
        message: ["User not found"]
      });
    
      // Vérifier si l'utilisateur a déjà les rôles
      const existingRoleIds = user.roles.map(r => r._id.toString());
      const rolesToAdd = addRoleToUserDTO.roleId.filter(roleId => !existingRoleIds.includes(roleId));
    
      if (rolesToAdd.length === 0) {
        return user; // Aucun nouveau rôle à ajouter
      }
    
      const roles = await this.findByField({ "_id": { $in: rolesToAdd } });
      if (roles.length !== rolesToAdd.length) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Role Error',
          message: ["One or more roles not found"]
        });
      }
    
      user.roles.push(...roles);
      return user.save();
    }
    
    async removeRoleToUser(objectReceiveFromFrontend)
    {
        let user = await this.usersService.findOneByField({"_id": objectReceiveFromFrontend.userId});
        if(!user) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["User not found"]
          });
        let role = await this.findOneByField({"_id": objectReceiveFromFrontend.roleId});
        if(!role) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
          });

        let index = user.roles.findIndex((r)=>r._id==objectReceiveFromFrontend.roleId);
        console.log("index :", index)
        if(index>-1) user.roles.splice(index,1);

        return await user.save();
    }

    async findUsersByRole(roleId:string)
    {
        let role = await this.findOneByField({"_id":roleId});
        if(!role) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
            });
        
        let tabUserByRole = await this.usersService.findByField({"roles":{"_id":roleId}});
        return this.usersService.findByField({"roles":{"_id":roleId}})

    }

    async deleteRole(roleId:string)
    {
      let role = await this.findOneByField({"_id":roleId});
      if(!role) throw new BadRequestException({
          statusCode:HttpStatus.BAD_REQUEST,
          error:'Role Error',
          message:["Role not found"]
      });

      let usersRole = await this.findUsersByRole(roleId);
      
      await this.executeWithTransaction(async (session)=>{
        //supprimer le role chez les utilisateurs
        await Promise.all(usersRole.map(async (user)=>{
          let index = user.roles.findIndex((r)=>r._id.toString() == roleId);
          if(index>-1) {
            user.roles.splice(index,1);
            user.save({session})
          }
        }))
        this.delete({_id:roleId});
      })
    }
        
}