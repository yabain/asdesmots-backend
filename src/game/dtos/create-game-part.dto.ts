import { Transform } from "class-transformer";
import { IsDate, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { ObjectId } from "mongoose";


/**
 * @apiDefine CreateGamePartDTO Create new game part
 * @apiBody {String {4..65}} name Game part name
 * @apiBody {String {4..65}} description Game part description
 * @apiBody {String} gameLevel game level identifier
 * @apiBody {Number} numberOfWord Number of words in the game
 * @apiBody {Number} maxPlayersNumber  Maximum number of player
 * @apiBody {Date} [startDate] game part start date
 * @apiBody {Date} [endDate] game part end date
 */
export class CreateGamePartDTO
{
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    name:string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    description:string;

    @IsMongoId()
    gameLevel:ObjectId

    @IsNumber()
    @Min(1)
    numberOfWord:Number

    @IsOptional()
    @Transform(({value})=> value && new Date(value))
    @IsDate()
    startDate:Date;

    @IsOptional()
    @Transform(({value})=> value && new Date(value))
    @IsDate()
    endDate:Date;
}