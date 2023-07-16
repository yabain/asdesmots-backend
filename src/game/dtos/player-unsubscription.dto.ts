import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";

/**
 * @apiDefine PlayerUnSubscriptionDTO Nouvelle souscription d'un joueur a un jeu
 * @apiBody {String} gameID identifiant du jeu
 * @apiBody {String} playerID identifiant du joueur
 */
export class PlayerUnSubscriptionDTO
{
    @IsMongoId()
    gameID:ObjectId;

    @IsMongoId()
    playerID:ObjectId;
}