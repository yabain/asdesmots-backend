import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameArcarde, GameArcardeDocument, PlayerGameRegistration } from "../models";
import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class GameArcardeService extends DataBaseService<GameArcardeDocument>
{
    constructor(
        @InjectModel(GameArcarde.name) gameArcardeModel: Model<GameArcardeDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(gameArcardeModel,connection);
    }  

    async addSubscription(playerSubscription:PlayerGameRegistration,gameArcarde:GameArcarde,session=null)
    {
        let competitionGame=gameArcarde.competitionGames.find((competition)=>competition.localisation==playerSubscription.localisation);
        if(!competitionGame) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'GameLocationNotFound/GameArcarde-subscription',
            message:[`Unable to subscribe in this location`]
        })
        competitionGame.playerGameRegistrations.push(playerSubscription)
        return competitionGame.save({session})
    }

    async removeSubscription(playerSubscription:PlayerGameRegistration,gameArcarde:GameArcarde,session=null)
    {
        let competitionGameIndex=gameArcarde.competitionGames.findIndex((competition)=>competition.localisation==playerSubscription.localisation);
        if(competitionGameIndex<0) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'GameLocationNotFound/GameArcarde-unsubscription',
            message:[`Unable to unsubscribe in this location`]
        })
        
        gameArcarde.competitionGames.splice(competitionGameIndex,1)
        return gameArcarde.save({session})
    }
    
} 