import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameArcarde, GameArcardeDocument } from "../models";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameArcardeService extends DataBaseService<GameArcardeDocument>
{
    constructor(
        @InjectModel(GameArcarde.name) gameArcardeModel: Model<GameArcardeDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(gameArcardeModel,connection);
    }  
    
} 