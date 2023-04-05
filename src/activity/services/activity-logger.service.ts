import { ConsoleLogger, LogLevel, Injectable, Scope} from "@nestjs/common"
import { User } from "src/user/models";
// import { User as UserExpress } from "express"
import { ErrorLevel } from "../enum";
import { Activity } from "./../models"
import { ActivityService } from "./activity.service"

@Injectable()
export class ActivityLoggerService extends ConsoleLogger
{
    constructor(private activityService:ActivityService)
    {
        super();
    }
    async logActivity(activity:{date?:Date,owner?:User | Record<string,any> , description:string,hasError?:boolean,errorLevel?:ErrorLevel,otherProps?:Record<string,any>})
    {
        return this.activityService.create(activity);
    }
    private getLogActivityInstance(activity:Record<string,any>)
    {
        return this.activityService.getInstance(activity)
    }

}