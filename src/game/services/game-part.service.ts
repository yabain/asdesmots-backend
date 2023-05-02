import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { DataBaseService } from "src/shared/services/database";
import { GamePart, GamePartDocument } from "../models";

export class GamePartService extends DataBaseService<GamePartDocument>
{
    constructor(
        @InjectModel(GamePart.name) gamePartModel: Model<GamePartDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(gamePartModel,connection);
    }  
    
} 