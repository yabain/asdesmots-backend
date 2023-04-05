import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Activity } from "../models";

export class ActivityService
{
    constructor(
        @InjectModel(Activity.name) private activityModel:Model<Activity>,
        @InjectConnection() private readonly connection:mongoose.Connection
    ){}

    async create(activity):Promise<Activity>
    {
        return await new this.activityModel(activity).save();
    }

    getInstance(activity:Record<string,any>)
    {
        return new this.activityModel(activity)
    }

    async getActivityByPagination(userId:string, page:number,limit:number)
    {
        return this.activityModel.find<Activity>({"_id":userId}).sort({createdAt:1}).limit(limit).skip(page*limit).exec()
    }
    
}