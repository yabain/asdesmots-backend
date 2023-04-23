import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameArcarde, GameArcardeDocument, GameWinnerCriteria, GameWinnerCriteriaDocument } from "../models";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameWinnerCriteriaService extends DataBaseService<GameWinnerCriteriaDocument>
{
    constructor(
        @InjectModel(GameWinnerCriteria.name) gameWinnerCreteriaModel: Model<GameWinnerCriteriaDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(gameWinnerCreteriaModel,connection);
    }  
    
} 