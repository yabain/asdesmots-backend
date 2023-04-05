import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document } from "mongoose";
import { User } from "src/user/models";
import { ErrorLevel } from "../enum";

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
export class Activity extends Document
{

    @Prop({type:mongoose.Types.ObjectId,ref:User.name})
    owner:User;

    @Prop({default:""})
    description:string;

    @Prop({type:Boolean,default:false})
    hasError:Boolean;

    @Prop({enum:ErrorLevel,default:ErrorLevel.INFO})
    errorLevel:ErrorLevel;

    @Prop({type:Object, default:{}})
    otherProps:Record<string,any>;

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const ActivitySchema = SchemaFactory.createForClass(Activity)
