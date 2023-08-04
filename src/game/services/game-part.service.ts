import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { DataBaseService } from "src/shared/services/database";
import { GamePart, GamePartDocument } from "../models";
import { CreateGamePartDTO } from "../dtos";
import { HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { CompetitionGameService } from "./competition-game.service";
@Injectable()
export class GamePartService extends DataBaseService<GamePartDocument>
{
    constructor(
        @InjectModel(GamePart.name) gamePartModel: Model<GamePartDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private gameCompetitionService:CompetitionGameService
        ){
            super(gamePartModel,connection);
    } 
    
    async createNewGamePart(createGamePartDTO:CreateGamePartDTO)
    {
        let gameLevel = await this.findOneByField({"_id":createGamePartDTO.gameLevel});
        if(!gameLevel) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart-GameLevel',
            message:[`Game level not found`]
        })
        
        let gameCompetition = await this.gameCompetitionService.findOneByField({"_id":createGamePartDTO.gameCompetitionID});
        if(!gameCompetition) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart-GameCompetition',
            message:[`Competition not found`]
        })
        return this.executeWithTransaction(async (session)=>{
            let newGamePart = this.createInstance(createGamePartDTO);
            gameCompetition.gameParts.push(newGamePart);
            if(gameCompetition.gameParts.length>1) gameCompetition.isSinglePart=false;
            newGamePart = await newGamePart.save({session});
            await gameCompetition.save({session});
            return newGamePart;
        })
    }

    async deletGamePart(gameCompetitionID,gamePartID)
    {
        let gamePart = await this.findOneByField({"_id":gamePartID});
        if(!gamePart) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart',
            message:[`Game part not found`]
        })

        let gameCompetition = await this.gameCompetitionService.findOneByField({"_id":gameCompetitionID});
        if(!gameCompetition) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart-GameCompetition',
            message:[`Competition not found`]
        })

        return this.executeWithTransaction(async (session)=>{
            let gamePartIndex = gameCompetition.gameParts.findIndex((part)=>part.id==gamePartID);
            if(gamePartIndex>-1) 
            {
                gameCompetition.gameParts.splice(gamePartIndex,1);
                if(gameCompetition.gameParts.length<2) gameCompetition.isSinglePart=true;
                await gameCompetition.save({session});
            }
            return gamePart.delete({session});
        })
    }

    async getListOfPartOfCompetition(gameCompetitionID)
    {
        let gameCompetition = await this.gameCompetitionService.findOneByField({"_id":gameCompetitionID});
        if(!gameCompetition) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart-GameCompetition',
            message:[`Competition not found`]
        })
        return gameCompetition.gameParts;
    }
    
} 