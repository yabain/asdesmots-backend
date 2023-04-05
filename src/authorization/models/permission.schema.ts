import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";
import { ModulePermission } from "../enums";


export type PermissionDocument = HydratedDocument<Permission>

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
export class Permission extends Document
{
    @Prop({required:true,default:"",unique:true})
    name:string;

    @Prop({required:true,default:""})
    description:string;
   
    @Prop({default:false})
    isDeleted:boolean;

    @Prop({default:""})
    module:string;

    @Prop({default:false})
    isDisabled:boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission)