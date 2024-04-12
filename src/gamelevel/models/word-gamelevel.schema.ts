import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { User } from "src/user/models";
import { WordGameLevelLangType } from "../enums";

export type WordGameLevelDocument = HydratedDocument<WordGameLevel>


@Schema({
    toObject:{
        transform(doc, ret, options) {
            delete ret.__v
            delete ret.isDeleted

        },
    },
    toJSON:{
        transform(doc, ret, options) {
            delete ret.__v
            delete ret.isDeleted
        },
    }
})
export class WordGameLevel extends Document
{

    @Prop({default:""})
    name:string;

    @Prop({default:""})
    description:string;

    @Prop({enum:WordGameLevelLangType,default:WordGameLevelLangType.FR})
    type:WordGameLevelLangType;

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const WordGameLevelSchema = SchemaFactory.createForClass(WordGameLevel)
