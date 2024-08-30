import { IsBoolean, IsEnum, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";
import { GameState } from "../enum";

/**
 * @apiDefine ChangeGameCompetitionStateDTO Changing the state of a game competition .
 * @apiBody {String} gameArcardeID identifiant de l'arcarde
 * @apiBody {String} gameCompetitionID identifiant du jeu
 * @apiBody {String} state game status
 */
export class ChangeGameCompetitionStateDTO
{
    // @IsMongoId()
    // gameArcardeID:ObjectId;

    @IsMongoId()
    gameCompetitionID:ObjectId;

    @IsEnum(GameState)
    state:GameState;
}