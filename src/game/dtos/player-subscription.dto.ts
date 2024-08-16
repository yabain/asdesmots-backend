import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";

/**
 * @apiDefine PlayerSubscriptionDTO Nouvelle souscription d'un joueur a un jeu
 * @apiBody {String} gameID identifiant du jeu
 * @apiBody {String} playerID identifiant du joueur
 * @apiBody {String {4..65}} localisation zone de  localisation du jeu
 */
export class PlayerSubscriptionDTO
{
    // @IsMongoId()
    // gameID:ObjectId;

    // @IsMongoId()
    // playerID:ObjectId;

    // @IsString()
    // @MinLength(4)
    // @MaxLength(65)
    localisation:string
}