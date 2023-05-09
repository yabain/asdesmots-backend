import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { ObjectId } from "mongoose";

export class PlayerSubscriptionDTO
{
    @IsMongoId()
    gameID:ObjectId;

    @IsMongoId()
    playerID:ObjectId;

    @IsString()
    @MinLength(4)
    @MaxLength(65)
    localisation:string
}