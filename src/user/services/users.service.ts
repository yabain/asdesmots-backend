import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose";
import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos";
import { User, UserDocument } from "../models";
import { DataBaseService } from "src/shared/services/database";

@Injectable()
export class UsersService extends DataBaseService<UserDocument>
{
    constructor(
        @InjectModel(User.name) userModel: Model<UserDocument>,
        @InjectConnection() connection: mongoose.Connection
        ){
            super(userModel,connection);
    }  

    async confirmedAccount(user)
    {
        return this.update({"email":user.email},{emailConfirmed:true})
    }
    
}