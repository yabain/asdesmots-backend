import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { GamingService } from "src/gaming/services";
import { DataBaseService } from "src/shared/services/database";
import { EmailService } from "src/shared/services/emails";
import { UsersService } from "src/user/services";
import { CreateSubscriptionDTO } from "../dtos";
import { Subscription, SubscriptionDocument } from "../models";
import { SubscriptionEmailService } from "./subscription-email.service";

@Injectable()
export class SubscriptionService extends DataBaseService<SubscriptionDocument>
{
    constructor(
        @InjectModel(Subscription.name) subscriptionModel: Model<SubscriptionDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private subscriptionEmailService:SubscriptionEmailService,
        private usersService:UsersService,
        private gameService:GamingService
        )
    {
        super(subscriptionModel,connection);
    }  

    async createNewSubscription(createSubscriptionDTO:CreateSubscriptionDTO)
    {
        let subscription = this.findOneByField({owner:createSubscriptionDTO.ownerID,game:createSubscriptionDTO.ownerID})
        if(subscription) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Subscription error',
            message:["The user has already subscribed to this game"]
        })

        let game = this.gameService.findOneByField({"_id":createSubscriptionDTO.gameID});
        if(game) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Subscription error',
            message:["The game was not found"]
        })

        let owner = this.usersService.findOneByField({"_id":createSubscriptionDTO.ownerID});
        if(owner) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Subscription error',
            message:["User was not found"]
        })
        
        //trouver le moyen d'intégrer le payment a ce niveau
        let newSubscription = await this.create({
            period:createSubscriptionDTO.period,
            game,
            owner
        });

        await this.subscriptionEmailService.sendNewSubscriptionEmail(newSubscription);
        return newSubscription;
    }

    async removeSubscription(subscriptionID:String)
    {
        let subscription = await this.findOneByField({_id:subscriptionID});
        if(!subscription) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Subscription error',
            message:["Subscription was not found"]
        })

        await this.subscriptionEmailService.sendRemoveSubscriptionEmail(subscription);
        await this.update({"_id":subscription},{isDeleted:true})
        return subscription;
    }

    async reminderSubscription(subscriptionID:String)
    {
        let subscription = await this.findOneByField({_id:subscriptionID});
        if(!subscription) throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            error:'Subscription error',
            message:["Subscription was not found"]
        })
        await this.subscriptionEmailService.sendReminderSubscriptionEmail(subscription);
        return subscription;
    }
}