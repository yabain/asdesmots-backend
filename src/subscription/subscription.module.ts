import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose";
import { GamingModule } from "src/gaming/gaming.module";
import { SharedModule } from "src/shared/shared.module";
import { UserModule } from "src/user/user.module";
import { Subscription, SubscriptionSchema } from "./models";
import { SubscriptionEmailService, SubscriptionService } from "./services";

@Module({
    controllers:[],
    imports:[
        MongooseModule.forFeature([
            {name:Subscription.name,schema:SubscriptionSchema},
        ]),
        SharedModule,
        UserModule,
        GamingModule
    ],
    providers:[
        SubscriptionService,
        SubscriptionEmailService
    ],
    exports:[
        SubscriptionService
    ]
})
export class SubscriptionModule{}