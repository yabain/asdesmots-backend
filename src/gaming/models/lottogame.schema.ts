import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";


export type LottoGameDocument = HydratedDocument<LottoGame>

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
export class LottoGame extends Document
{
    @Prop({required:true,default:"",unique:true})
    name:string;

    @Prop({required:true,default:""})
    description:string;
   
    @Prop({default:false})
    isDeleted:boolean;

    @Prop({default:false})
    isDisabled:boolean;
}

export const LottoGameSchema = SchemaFactory.createForClass(LottoGame)