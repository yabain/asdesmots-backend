import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument } from "mongoose";
import { LottoGame } from "src/gaming/models";
import { User } from "src/user/models";


export type SubscriptionDocument = HydratedDocument<Subscription>

@Schema({
    toObject: {
        transform: function (doc, ret) {
          delete ret.isDeleted;
          delete ret.__v;
        }
      },
      toJSON: {
        transform: function (doc, ret) {
          delete ret.__v;

        }
      }
})
export class Subscription extends Document
{
  @Prop({type:mongoose.Types.ObjectId,ref:User.name,default:null})
  owner:User;

  @Prop({type:mongoose.Types.ObjectId,ref:LottoGame.name})
  game:LottoGame;
  
  @Prop({required:true,default:""})
  period:String;

  @Prop({default:Date.now(),required:true})
  createdAt:Date

  @Prop({default:false})
  isDeleted:boolean;

  @Prop({default:false})
  isDisabled:boolean;
  
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription)