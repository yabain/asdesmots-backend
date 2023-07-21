import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { WordGameLevel } from "./word-gamelevel.schema";

export type GameLevelDocument = HydratedDocument<GameLevel>

@Schema({
    toObject:{
        transform(doc, ret, options) {
            // if(ret.owner) ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted

        },
    },
    toJSON:{
        transform(doc, ret, options) {
            // if(ret.owner) ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted
        },
    }
})
export class GameLevel extends Document
{

    @Prop({default:"", unique:true})
    name:string;

    @Prop({default:""})
    description:string;

    @Prop({type:[{type:mongoose.Types.ObjectId,ref:WordGameLevel.name}],default:[]})
    words:WordGameLevel[]

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GameLevelSchema = SchemaFactory.createForClass(GameLevel)
