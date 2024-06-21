import { IsNumber, IsString } from "class-validator";

/**
 * @apiDefine SortGameLevelDTO Sort game levels
 * @apiBody {String} id Game level id
 * @apiBody {Number} level Game level level
 */
export class SortGameLevelDTO
{
    @IsString()
    id: String;

    @IsNumber()
    level: Number;
}