import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { User } from "src/user/models";

export type GameWinnerDocument = HydratedDocument<GameWinner>

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
export class GameWinner extends Document
{
    @Prop({default:0})
    position:Number;
    
    @Prop({type:mongoose.Types.ObjectId,ref:User.name,default:null})
    player:User;

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GameWinnerSchema = SchemaFactory.createForClass(GameWinner)
