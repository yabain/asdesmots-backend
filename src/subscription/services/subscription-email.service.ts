import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "src/shared/services/emails";
import { Subscription } from "../models";

@Injectable()
export class SubscriptionEmailService
{
    constructor(private emailService:EmailService,private configService:ConfigService){}

    async sendNewSubscriptionEmail(subscription:Subscription)
    {
        await this.emailService.sendTemplateEmail(
            this.configService.get<string>("NO_REPLY_EMAIL_SENDER"),
            subscription.owner.email,            
            this.configService.get<string>("EMAIL_TEMPLATE_NEW_SUBSCRIPTION"),
            {}
        )
    }

    async sendReminderSubscriptionEmail(subscription:Subscription)
    {
        await this.emailService.sendTemplateEmail(
            this.configService.get<string>("NO_REPLY_EMAIL_SENDER"),
            subscription.owner.email,            
            this.configService.get<string>("EMAIL_TEMPLATE_REMIND_SUBSCRIPTION"),
            {}
        )
    }

    async sendRemoveSubscriptionEmail(subscription:Subscription) {
        await this.emailService.sendTemplateEmail(
            this.configService.get<string>("NO_REPLY_EMAIL_SENDER"),
            subscription.owner.email,            
            this.configService.get<string>("EMAIL_TEMPLATE_CANCELED_SUBSCRIPTION"),
            {}
        )
    }

}