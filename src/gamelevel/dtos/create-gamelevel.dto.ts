import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * @apiDefine CreateGameLevelDTO Create new game level
 * @apiBody {String {4..65}} name Game level name
 * @apiBody {String {4..65}} description Game level description
 */
export class CreateGameLevelDTO
{
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    name:String;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    description:String;
}