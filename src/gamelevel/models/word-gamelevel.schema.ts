import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document } from "mongoose";
import { User } from "src/user/models";

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
export class QuestionGameLevel extends Document
{

    @Prop({default:""})
    name:string;

    @Prop({default:""})
    description:string;

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const QuestionGameLevelSchema = SchemaFactory.createForClass(QuestionGameLevel)
