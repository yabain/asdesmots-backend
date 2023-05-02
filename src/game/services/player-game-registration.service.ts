import { Injectable } from "@nestjs/common/decorators";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { DataBaseService } from "src/shared/services/database";
import { PlayerGameRegistration, PlayerGameRegistrationDocument } from "../models";

@Injectable()
export class PlayerGameRegistrationService extends DataBaseService<PlayerGameRegistrationDocument>
{
    constructor(
        @InjectModel(PlayerGameRegistration.name) playerGameRegistrationModel: Model<PlayerGameRegistrationDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(playerGameRegistrationModel,connection);
    }  
    
} 