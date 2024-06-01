import { MaxLength,MinLength,IsOptional,IsUrl,IsNotEmpty,IsString, Matches, IsPhoneNumber, IsMobilePhone, Validate } from "class-validator";
import { IsUnique, UniqueValidator } from "src/shared/helpers/unique-validator";

/**
 * @apiDefine CreateUserDTO Create user information
 * @apiBody {String {4..65}} firstName user firstname
 * @apiBody {String {4..65}} lastname User lastname
 * @apiBody {String {8..}} password User password
 * @apiBody {String} email User email
 * @apiBody {String} profilePicture User picture
 * @apiBody {String} [country] User country
 * @apiBody {String} [location] User location
 */
export class CreateUserDTO
{
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(65)
    @IsString()
    firstName:string;

    @IsNotEmpty()
    @MinLength(4)
    @IsString()
    @MaxLength(65)
    lastName:string;

    @IsNotEmpty()
    @MinLength(8)
    @IsString()
    @Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    password:string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])")
    @IsUnique({ message: 'Email already exists'})
    email:string;

    @IsOptional()
    @IsString()
    @IsUrl()
    profilePicture:string;

    @IsOptional()
    @MinLength(4)
    @IsString()
    country:string;

    @IsOptional()
    @MinLength(4)
    @IsString()
    location:string;

    @IsOptional()
    @IsMobilePhone()
    phoneNumber:string;

}