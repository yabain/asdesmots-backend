import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { GameLevel } from "src/gamelevel/models";
import { GameRound } from "./game-round.schema";

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
export class GamePart extends Document
{

    @Prop({type:mongoose.Types.ObjectId,ref:GameRound.name,default:null})
    gameRound:GameRound;

    @Prop({type:mongoose.Types.ObjectId,ref:GameLevel.name,default:null})
    gameLevel:GameLevel;

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GamePartSchema = SchemaFactory.createForClass(GamePart)
