import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

export class PlayerSubscriptionDTO
{
    @IsMongoId()
    gameID:ObjectId;

    @IsMongoId()
    playerID:ObjectId;
}