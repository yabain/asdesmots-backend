import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { IsUnique } from "../validators/level-unique";

/**
 * @apiDefine CreateGameLevelDTO Create new game level
 * @apiBody {String {4..65}} name Game level name
 * @apiBody {String {4..65}} description Game level description
 */
export class CreateGameLevelDTO
{
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    @IsUnique({ message: 'Level already exists'})
    name:String;

    @IsOptional()
    @IsString()
    @MinLength(1)
    description:String;
}