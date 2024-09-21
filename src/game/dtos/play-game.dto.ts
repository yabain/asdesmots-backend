import { IsMongoId, IsNumberString, IsString } from "class-validator";
import { ObjectId } from "mongoose";

export class PlayGameDTO
{
    @IsMongoId()
    competitionID:ObjectId

    @IsMongoId()
    playerID:ObjectId;

    @IsString()
    word:string;
    
    @IsNumberString()
    gameRoundStep 
    
    @IsString()
    gamePartID
}