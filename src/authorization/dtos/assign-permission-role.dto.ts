import { ArrayMinSize, IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

/**
 * @apiDefine AssignPermissionRoleDTO Request body to assign a permission to a role
 * @apiBody {Array} permissionId array of Permission ID
 * @apiBody {String} roleId Role ID
 */
export class AssignPermissionRoleDTO
{
    @IsMongoId({each:true})
    @ArrayMinSize(1)
    permissionId:Array<ObjectId>

    @IsMongoId()
    roleId:string
}