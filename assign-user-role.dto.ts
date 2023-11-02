import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

/**
 * Définition de la documentation du model app
 * @apiDefine AddRoleUserDTO Body of the request to assign a role to a user
 * @apiBody {String} userId User ID
 * @apiBody {String} roleId Role ID
 */

export class AssignUserRoleDTO
{
    @IsMongoId()
    userId:string

    @IsMongoId({each: true})
    roleId:Array<ObjectId>
}