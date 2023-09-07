import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { GameLevel } from "src/gamelevel/models";
import { GameRound } from "./game-round.schema";
import { GameState } from "../enum";

export type GamePartDocument = HydratedDocument<GamePart>

@Schema({
    toObject:{
        transform(doc, ret, options) {
            if(ret.owner) ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted

        },
    },
    toJSON:{
        transform(doc, ret, options) {
            if(ret.owner) ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted
        },
    }
})
export class GamePart extends Document //Manche de jeux
{
    
    @Prop({default:"", unique:true})
    name:string;

    @Prop({default:""})
    description:string;
    
    @Prop({type:[{type:mongoose.Types.ObjectId,ref:GameRound.name}],default:[]})
    gameRound:GameRound[];

    @Prop({type:mongoose.Types.ObjectId,ref:GameLevel.name,default:null})
    gameLevel:GameLevel;

    @Prop({type:Number,default:1})
    numberOfWord:Number

    @Prop({enum:GameState,default:GameState.NO_START})
    gameState:GameState;

    @Prop({type:Date,default:Date.now()})
    startDate:Date;

    @Prop({type:Date,default:Date.now()})
    endDate:Date;
    
    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GamePartSchema = SchemaFactory.createForClass(GamePart)
