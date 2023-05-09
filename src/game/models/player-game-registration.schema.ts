import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { User } from "src/user/models";

export type PlayerGameRegistrationDocument = HydratedDocument<PlayerGameRegistration>

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
export class PlayerGameRegistration extends Document
{

    @Prop({default:0})
    lifeGame:Number;

    @Prop({default:false})
    hasLostGame:Boolean;

    @Prop({type:mongoose.Types.ObjectId,ref:User.name,default:null})
    player:User;    

    @Prop({unique:true})
    localisation:string

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const PlayerGameRegistrationSchema = SchemaFactory.createForClass(PlayerGameRegistration)
