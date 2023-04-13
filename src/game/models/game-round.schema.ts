import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { GameLevel } from "src/gamelevel/models";

export type GameRoundDocument = HydratedDocument<GameRound>

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
export class GameRound extends Document
{

    @Prop({default:0})
    step:number;

    @Prop({type:mongoose.Types.ObjectId,ref:GameLevel.name,default:null})
    gameLevel:GameLevel

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GameRoundSchema = SchemaFactory.createForClass(GameRound)
