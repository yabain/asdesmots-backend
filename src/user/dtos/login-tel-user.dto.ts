import { IsNotEmpty, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

/**
 * @apiDefine LoginUserDTO Login user information
 * @apiBody {String} email User email
 * @apiBody {String {8..}} password User password
 */
export class LoginTelUserDTO
{
    @IsNotEmpty()
    @MinLength(8)
    @IsString()
    @Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    password:string;

    @IsPhoneNumber()
    phoneNumber:string;
}