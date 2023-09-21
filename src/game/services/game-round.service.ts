import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { DataBaseService } from "src/shared/services/database";
import { GameRound, GameRoundDocument } from "../models";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameRoundService extends DataBaseService<GameRoundDocument>
{
    constructor(
        @InjectModel(GameRound.name) gameArcardeModel: Model<GameRoundDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(gameArcardeModel,connection,['gameLevel']);
    }  
}