import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose";
import { Permission, PermissionDocument } from "../models";
import { DataBaseService } from "src/shared/services/database";

@Injectable()
export class PermissionsService extends DataBaseService<PermissionDocument>
{
    constructor(
        @InjectModel(Permission.name) permissionModel: Model<PermissionDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(permissionModel,connection);
    }  
    
}