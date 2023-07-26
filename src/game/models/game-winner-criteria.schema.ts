import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { GameWinnerCriteriaType } from "../enum";

export type GameWinnerCriteriaDocument = HydratedDocument<GameWinnerCriteria>

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
export class GameWinnerCriteria extends Document
{
    @Prop({default:"", unique:true})
    name:string;

    @Prop({default:""})
    description:string;

    @Prop({enum:GameWinnerCriteriaType,default:GameWinnerCriteriaType.MAX_PTS})
    gameWinnerCriteriaType:GameWinnerCriteriaType

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GameWinnerCriteriaSchema = SchemaFactory.createForClass(GameWinnerCriteria)


