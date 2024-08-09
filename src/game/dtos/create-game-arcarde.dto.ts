import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { IsUnique } from "../validators/arcade-unique";


/**
 * @apiDefine CreateGameArcardeDTO Create new game arcarde
 * @apiBody {String {4..65}} name Game arcarde name
 * @apiBody {String {4..65}} description Game arcarde description
 * @apiBody {Boolean} [isOnlineGame] is set to true if the game is online and false otherwise
 * @apiBody {Boolean} [canRegisterPlayer] Is set to true if players can register or not
 * @apiBody {Boolean} [isFreeRegistrationPlayer] Is set to true if the participation in the games is free or not
 * @apiBody {Number} maxPlayersNumber  Maximum number of player
 * @apiBody {Date} startDate game start date
 * @apiBody {Date} endDate game end date
 * @apiBody {String} localisation  competition location area
 * @apiBody {Date} startRegistrationDate game registration start date
 * @apiBody {Date} endRegistrationDate game registration end date
 */
export class CreateGameArcardeDTO
{
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    @IsUnique({ message: 'Arcade already exists'})
    name:string;

    @IsOptional()
    @IsString()
    description:string;

    @IsOptional()
    @IsBoolean()
    isOnlineGame:Boolean;

    @IsOptional()
    @IsBoolean()
    canRegisterPlayer:Boolean;

    @IsOptional()
    @IsBoolean()
    isFreeRegistrationPlayer:Boolean;

    @IsNumber()
    @Max(100)
    @Min(1)
    maxPlayersNumber:Number;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    localisation:String
    
    @Transform(({value})=> value && new Date(value))
    @IsDate()
    startDate:Date;

    @Transform(({value})=> value && new Date(value))
    @IsDate()
    endDate:Date;
    
    @Transform(({value})=> value && new Date(value))
    @IsDate()
    startRegistrationDate:Date;

    @Transform(({value})=> value && new Date(value))
    @IsDate()
    endRegistrationDate:Date;
}