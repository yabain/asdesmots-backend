import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { WordGameLevelLangType } from "../enums";

/**
 * @apiDefine CreateWordGameLevelDTO Create a new word from a game level
 * @apiBody {String {4..65}} name word name
 * @apiBody {String {4..65}} description word description
 * @apiBody {String} gameLevelId Identifier of the game level associated with the word
 * @apiBody {String} type Type of the word. it can have the value 'en' for English words and 'fr' for French words
 */
export class CreateWordGameLevelDTO
{
    @IsString()
    @MinLength(1)
    @MaxLength(254)
    name:String;

    @IsOptional()
    @IsString()
    @MinLength(1)
    description:String;

    @IsMongoId()
    gameLevelId:String;

    @IsEnum(WordGameLevelLangType)
    type:WordGameLevelLangType

}