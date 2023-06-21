import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { WordGameLevel, WordGameLevelDocument } from "../models";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateWordGameLevelDTO } from "../dtos";
import { GameLevelService } from "./gamelevel.service";

@Injectable()
export class WordGameLevelService extends DataBaseService<WordGameLevelDocument>
{
    constructor(
        @InjectModel(WordGameLevel.name) wordGameLevelModel: Model<WordGameLevelDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private gameLevelService:GameLevelService
        ){
            super(wordGameLevelModel,connection);
    }  

    async newWordGameLevel(newWordGameLevel:CreateWordGameLevelDTO)
    {
        let gameLevel = await this.gameLevelService.findOneByField({"_id":newWordGameLevel.gameLevelId});
        if(!gameLevel) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["Game level not found"]
        })
        let wordGameLevel= this.createInstance(newWordGameLevel)
        gameLevel.words.push(wordGameLevel) 
        
        return this.executeWithTransaction(async (session)=>{
            await gameLevel.save({session});
            return wordGameLevel.save({session})
        })
    }
    
} 