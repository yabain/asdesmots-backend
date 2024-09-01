import { ArrayMinSize, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";

/**
 * @apiDefine ApplyGameWriteriaToGammeDTO Application d'un critére de jeu a une compétition
 * @apiBody {String} gameID identifiant de la compétition de jeu
 * @apiBody {String} gammeWinnersID identifiant d'un critére de jeu
 */
export class ApplyGameWriteriaToGammeDTO
{
    @IsMongoId()
    gameID:ObjectId;

    @IsMongoId({each:true})
    @ArrayMinSize(1)
    gammeWinnersID:ObjectId[];  
}