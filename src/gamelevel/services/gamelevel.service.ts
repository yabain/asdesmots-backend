import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameLevel, GameLevelDocument } from "../models";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameLevelService extends DataBaseService<GameLevelDocument>
{
    constructor(
        @InjectModel(GameLevel.name) gameLevelModel: Model<GameLevelDocument>,
        @InjectConnection() connection: mongoose.Connection,
        
        ){
            super(gameLevelModel,connection,["words"]);
    }  
    
    // async deleteGameLevel(gameLevelID:string):Promise<any>
    // {
        
    // }
    
    async swapLevels(oldLevelPosition: Number, newLevelPosition: Number): Promise<void> {
        const session = await this.connection.startSession();
        session.startTransaction();
    
        try {
          const [elemAtOldLevelPosition, elemAtNewLevelPosition] = await Promise.all([
            await this.findOneByField({level: oldLevelPosition},null,session),
            await this.findOneByField({level: newLevelPosition},null,session)
          ]);

          // Temporarily set one of the levels to a unique temporary value
          const tempLevel = -1;
          const oldLevel = elemAtOldLevelPosition.level;
          const newLevel = elemAtNewLevelPosition?.level;
    
          // Update position level to tempLevel
          if(newLevel)
            await this.update({ level: newLevelPosition }, { level: tempLevel },session);
    
          // Update position level to oldLevel
          await this.update({ _id: elemAtOldLevelPosition._id }, { level: newLevelPosition },session);
    
          // Update position level to newLevel
          if(newLevel)
            await this.update({ _id: elemAtNewLevelPosition._id }, { level: oldLevel },session);
    
          await session.commitTransaction();
          session.endSession();
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
    }
} 