import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document } from "mongoose";
import { User } from "src/user/models";

@Schema({
    toObject:{
        transform(doc, ret, options) {
            ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted

        },
    },
    toJSON:{
        transform(doc, ret, options) {
            ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted
        },
    }
})
export class BugActivity extends Document
{
    @Prop({default:Date.now(),type:Date})
    date:Date;

    @Prop({type:mongoose.Types.ObjectId,ref:User.name})
    owner:User;

    @Prop({default:""})
    description:string;

    @Prop({type:Object,default:{}})
    request:Record<string,any>;

    @Prop({type:Object, default:{}})
    response:Record<string,any>;

    @Prop({type:Boolean,default:false})
    hasError:Boolean;

    @Prop({type:Object, default:{}})
    otherProps:Record<string,any>;

    @Prop({type:Object, default:{}})
    error:Record<string,any>;
}

export const BugActivitySchema = SchemaFactory.createForClass(BugActivity)
