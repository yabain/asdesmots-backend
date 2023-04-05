import { IsMongoId } from "class-validator";

/**
 * @apiDefine AssignPermissionRoleDTO Request body to assign a permission to a role
 * @apiBody {String} permissionId Permission ID
 * @apiBody {String} roleId Role ID
 */
export class AssignPermissionRoleDTO
{
    @IsMongoId()
    permissionId:string;

    @IsMongoId()
    roleId:string
}