import { ArrayMinSize, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";

/**
 * @apiDefine ApplyGameWriteriaToGammeDTO Application d'un ensemble de critére de jeu a une compétition
 * @apiBody {String} gameID identifiant de la compétition de jeu
 * @apiBody {Array} gammeWinnersID Liste des identifiants des critéres de jeu
 */
export class ApplyGameWriteriaToGammeDTO
{
    @IsMongoId()
    gameID:ObjectId;

    @IsMongoId({each:true})
    @ArrayMinSize(1)
    gammeWinnersID:ObjectId;  
}