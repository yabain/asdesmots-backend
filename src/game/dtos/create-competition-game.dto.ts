import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { ObjectId } from "mongoose";
import { WordGameLevelLangType } from "src/gamelevel/enums";
import { CreateGamePartDTO } from "./create-game-part.dto";


/**
 * @apiDefine CreateCompetitionGameDTO Create new game competition
 * @apiBody {String {4..65}} name Game competition name
 * @apiBody {String {4..65}} description Game competition description
 * @apiBody {Number} level level of games
 * @apiBody {Boolean} isSinglePart It's set to true if it's a one-party competition
 * @apiBody {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
 * @apiBody {String} localisation  competition location area
 * @apiBody {Number} maxPlayerLife  Maximum number of lives of a player in the competition
 * @apiBody {Number} maxTimeToPlay  Number of times defined in seconds to rent to a player to enter a word.
 * @apiBody {Date} startDate game start date
 * @apiBody {Date} endDate game end date
 * @apiBody {Number} maxOfWinners  Maximum number of winners per competition
 * @apiBody {String} lang Language of the competition. it can be "en" for English and "fr" for French
 * @apiBody {String} [parentCompetition] In case it is a sub competition, this value represents the parent competition
 * @apiBody {String[]} gameWinnerCriterias competition winning criteria ID table
 * @apiBody {String[]} gameJudgesID competition judge ID 
 * @apiBody {CreateGamePartDTO[]} gameJudges competition judges ID table
 */

export class CreateCompetitionGameDTO
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

    @IsNumber()
    level:Number;

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
    maxPlayerLife:Number;

    @IsNumber()
    maxTimeToPlay:Number;

    @Transform(({value})=> value && new Date(value))
    @IsDate()
    startDate:Date;

    @Transform(({value})=> value && new Date(value))
    @IsDate()
    endDate:Date;

    @IsNumber()
    maxOfWinners:Number;

    @IsMongoId({each:true})
    @ArrayMinSize(0)
    gameWinnerCriterias:ObjectId[];

    @IsOptional()
    @IsMongoId()
    gameJudgeID:ObjectId;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each:true })
    @Type(()=> CreateGamePartDTO)
    gameParts:CreateGamePartDTO[];

    @IsOptional()
    @IsMongoId()
    parentCompetition:ObjectId;

    @IsEnum(WordGameLevelLangType)
    lang:WordGameLevelLangType;
}