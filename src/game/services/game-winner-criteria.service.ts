import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameArcarde, GameArcardeDocument, GameWinnerCriteria, GameWinnerCriteriaDocument } from "../models";
import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { ApplyGameWriteriaToGammeDTO } from "../dtos";
import { CompetitionGameService } from "./competition-game.service";

@Injectable()
export class GameWinnerCriteriaService extends DataBaseService<GameWinnerCriteriaDocument>
{
    constructor(
        @InjectModel(GameWinnerCriteria.name) gameWinnerCreteriaModel: Model<GameWinnerCriteriaDocument>,
        @InjectConnection() connection: mongoose.Connection,
        ){
            super(gameWinnerCreteriaModel,connection);
    }     
} 