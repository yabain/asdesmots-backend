import { IsNotEmpty, IsString,MaxLength, MinLength } from "class-validator";

/**
 * @apiDefine CreateRoleDTO Request body to assign a permission to a role
 * @apiBody {String} name Role name. this name must be unique
 * @apiBody {String} description Role description
 */
export class CreateRoleDTO
{
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @MinLength(1)
    name:string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    @MinLength(5)
    description:string;
}