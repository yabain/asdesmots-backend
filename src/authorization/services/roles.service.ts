import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose";
import { Role, RoleDocument } from "../models";
import { DataBaseService } from "src/shared/services/database";
import { AssignPermissionRoleDTO, AssignUserRoleDTO } from "../dtos";
import { PermissionsService } from "./permissions.service";
import { UsersService } from "src/user/services";

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

    async addRoleToUser(addRoleToUserDTO:AssignUserRoleDTO)
    {
        let user = await this.usersService.findOneByField({"_id":addRoleToUserDTO.userId});
        if(!user) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["User not found"]
          });

        let roleTableForUpdate = new Array<Role>;
        for(let roleId of addRoleToUserDTO.roleId){

          let role = await this.findOneByField({"_id":roleId});

          if(!role) {
            throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
            })
          }else{
            roleTableForUpdate.push(role);
          }
      }
      user.roles = [];
      for (let roleId of roleTableForUpdate){
        user.roles.push(roleId);
      }
      return user.save();
    }

//     async addRoleToUser(addRoleToUserDTO: AssignUserRoleDTO)
//     {
//       try {
//         let user = await this.usersService.findOneByField({"_id":addRoleToUserDTO.userId});
//         if(!user) throw new BadRequestException({
//             statusCode:HttpStatus.BAD_REQUEST,
//             error:'Role Error',
//             message:["User not found"]
//           });
//         let roles = await this.findOneByField({"_id":{ $in: addRoleToUserDTO.roleId}});
//         if (!Array.isArray(roles)) {
//           throw new TypeError('La valeur de "roles" n\'est pas un tableau.');
//         }
    
//         const missingRoleIds: string[] = [];
    
//         // Vérification de l'existence de tous les rôles
//         roles.forEach((role) => {
//           if (!addRoleToUserDTO.roleId.includes(role._id.toString())) {
//             missingRoleIds.push(role._id.toString());
//           }
//         });
    
//         if (missingRoleIds.length > 0) {
//           throw new NotFoundException({
//             message: `Rôles introuvables avec les IDs: ${missingRoleIds.join(', ')}`,
//           });
//         }
    
//         // Association des rôles à l'utilisateur
//         user.roles = roles.map((role) => role._id);
//         await user.save();
//       }catch(error) {
// // Gestion des erreurs spécifiques
//         if (error instanceof NotFoundException) {
//           throw error;
//         } else if (error instanceof TypeError) {
//             throw new InternalServerErrorException({
//             message: 'An error occurred while accessing the database.',
//           });
//         } else {
//           throw error;
//         }
//       }
       
//     }

    async removeRoleToUser(removeRoleToUserDTO:AssignUserRoleDTO)
    {
        let user = await this.usersService.findOneByField({"_id":removeRoleToUserDTO.userId});
        if(!user) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["User not found"]
          });
        let role = await this.findOneByField({"_id":removeRoleToUserDTO.roleId});
        if(!role) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
          });

        let index = user.roles.findIndex((r)=>r.id==role.id);
        if(index>-1) user.roles.splice(index,1);

        return user.save();
    }

    async findUsersByRole(roleId:string)
    {
        let role = await this.findOneByField({"_id":roleId});
        if(!role) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Role Error',
            message:["Role not found"]
            });
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
      return this.executeWithTransaction(async (session)=>{
        //supprimer le role chez les utilisateurs
        await Promise.all(usersRole.map(async (user)=>{
          let index = user.roles.findIndex((r)=>r.id==role.id);
          if(index>-1) {
            user.roles.splice(index,1);
            user.save({session})
          }
        }))
        await this.delete({_id:roleId},session);
      })
      
    }
        
}