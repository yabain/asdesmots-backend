import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { ObjectId } from "mongoose";
import { WordGameLevelLangType } from "src/gamelevel/enums";
import { CreateGamePartDTO } from "./create-game-part.dto";
import { IsUnique } from "../validators/competition-unique";


/**
 * @apiDefine CreateCompetitionGameDTO Create new game competition
 * @apiBody {String {4..65}} name Game competition name
 * @apiBody {String {4..65}} description Game competition description
 * @apiBody {String} gameLevel ID of games level
 * @apiBody {Boolean} isSinglePart It's set to true if it's a one-party competition
 * @apiBody {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
 * @apiBody {String} localisation  competition location area 
 * @apiBody {Number} maxPlayerLife  Maximum number of lives of a player in the competition
 * @apiBody {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
 * @apiBody {Date} startDate game start date
 * @apiBody {Date} endDate game end date
 * @apiBody {Number} maxOfWinners  Maximum number of winners per competition
 * @apiBody {String} lang Language of the competition. it can be "en" for English and "fr" for French
 * @apiBody {String} parentCompetition In case it is a sub competition, this value represents the parent competition
 * @apiBody {String[]} [gameWinnerCriterias] competition winning criteria ID table
 * @apiBody {String} [gameJudgeID] competition judge ID 
 */

export class CreateCompetitionGameDTO
{
    @IsString()
    @MinLength(4)
    @MaxLength(65)
    @IsUnique({ message: 'Competition already exists'})
    name:string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    description:string;

    @IsMongoId()
    gameLevel:ObjectId;

    @IsBoolean()
    isSinglePart:Boolean;

    @IsOptional()
    @IsBoolean()
    canRegisterPlayer:Boolean;

    @IsString()
    @MinLength(4)
    @MaxLength(65)
    localisation:String

    @IsNumber()
    maxPlayerLife:number;

    @IsNumber()
    maxTimeToPlay:number;

    @Transform(({value})=> value && new Date(value))
    @IsDate()
    startDate:Date;

    @Transform(({value})=> value && new Date(value))
    @IsDate()
    endDate:Date;

    @IsNumber()
    maxOfWinners:number;

    @IsOptional() //a changer lorsque nous alons gerer les critéres pour gager
    @IsMongoId({each:true})
    @ArrayMinSize(0)
    gameWinnerCriterias:ObjectId[];

    @IsOptional()
    @IsMongoId()
    gameJudgeID:ObjectId;

    @IsOptional()
    @IsMongoId()
    parentCompetition:ObjectId;

    @IsEnum(WordGameLevelLangType)
    lang:WordGameLevelLangType;
}