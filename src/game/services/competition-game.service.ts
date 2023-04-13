import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { CompetitionGame, CompetitionGameDocument } from "../models";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CompetitionGameService extends DataBaseService<CompetitionGameDocument>
{
    constructor(
        @InjectModel(CompetitionGame.name) competitionGameModel: Model<CompetitionGameDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(competitionGameModel,connection);
    }  
    
} 