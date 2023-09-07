import { IsBoolean, IsEnum, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";
import { GameState } from "../enum";

/**
 * @apiDefine ChangeGameArcardeStateDTO Changing the state of a game (arcade, competition and game play).
 * @apiBody {String} gameArcardeID identifiant du jeu
 * @apiBody {String} state game status
 */
export class ChangeGameArcardeStateDTO
{
    @IsMongoId()
    gameArcardeID:ObjectId;

    @IsEnum(GameState)
    state:GameState;
}