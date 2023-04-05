import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Subscription } from "rxjs";
import { DataBaseService } from "src/shared/services/database";
import { LottoGame, LottoGameDocument } from "../models";

export class GamingService extends DataBaseService<LottoGame>
{
    constructor(
        @InjectModel(LottoGame.name) lottoGameModel: Model<LottoGameDocument>,
        @InjectConnection() connection: mongoose.Connection
        )
    {
        super(lottoGameModel,connection);
    }  

}