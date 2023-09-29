import { IsMongoId, IsString } from "class-validator";
import { ObjectId } from "mongoose";

export class JoinGameDTO
{
    @IsMongoId()
    competitionID:ObjectId

    @IsMongoId()
    playerID:ObjectId;
}