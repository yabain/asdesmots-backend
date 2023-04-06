import { IsNotEmpty, MinLength, IsString, Matches, IsMongoId, IsBoolean } from "class-validator";

/**
 * @apiDefine UpdateAccountStatusDTO Request body to update user status
 * @apiBody {String} userId User ID
 * @apiBody {String} status User status
 */
export class UpdateAccountStatusDTO
{
    @IsMongoId()
    userId:string

    @IsBoolean()
    status:boolean;
}