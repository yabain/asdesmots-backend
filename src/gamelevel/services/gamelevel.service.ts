import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameLevel, GameLevelDocument } from "../models";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameLevelService extends DataBaseService<GameLevelDocument>
{
    constructor(
        @InjectModel(GameLevel.name) gameLevelModel: Model<GameLevelDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(gameLevelModel,connection);
    }  
    
    // async deleteGameLevel(gameLevelID:string):Promise<any>
    // {
        
    // }
} 