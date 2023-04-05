import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument } from "mongoose";
import { Permission } from "./permission.schema";

export type RoleDocument = HydratedDocument<Role>

@Schema({
    toObject: {
        transform: function (doc, ret) {
          delete ret.isDeleted;
          delete ret.__v;
        }
      },
      toJSON: {
        transform: function (doc, ret) {
          delete ret.password;
          delete ret.__v;

        }
      }
})
export class Role extends Document
{
    @Prop({required:true,default:"",unique:true})
    name:string;

    @Prop({required:true,default:""})
    description:string;

    @Prop({type:[mongoose.Types.ObjectId],ref:Permission.name,default:[]})
    permissions:Permission[]

    @Prop({default:false})
    isDeleted:boolean;

    @Prop({default:false})
    isDisabled:boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role)