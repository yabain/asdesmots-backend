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
            super(playerGameRegistrationModel,connection,["player","competition"]);
    }  

    async getListOfGameSubscriptionByPlayerId(playerId:string)
    {
        return await Promise.all((await this.findAll()).filter((registration)=>registration.player._id == playerId).map((registration)=>registration.competition.populate(["gameParts","gameLevel"])));
    }

    async getPlayerSubscriber(playerID,conpititionID) {
        return await Promise.all((await this.findAll()).filter((sub)=>sub.player._id == playerID && sub.competition._id == conpititionID));
    }

    
} 