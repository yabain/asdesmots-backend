import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Activity, ActivitySchema } from "./models";
import { ActivityService,ActivityLoggerService } from "./services"
import { ActivityController } from "./controllers";


@Module({
    imports:[
        MongooseModule.forFeature([{name:Activity.name,schema:ActivitySchema}])
    ],
    providers:[ActivityService,ActivityLoggerService],
    controllers:[
        ActivityController
    ],
    exports:[ActivityService,ActivityLoggerService] 
})
export class ActivityModule{}