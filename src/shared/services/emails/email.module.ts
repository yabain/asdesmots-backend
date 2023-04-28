import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common"
import { EmailService } from "./email.service";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from "@nestjs/config";
import { AwsEmailService } from "./aws-email.service";
import { GmailEmailService } from "./gmail-email.service";


@Module({
    imports:[
        MailerModule.forRootAsync({
            imports:[ConfigService],
            inject:[ConfigService],
            useFactory: (configService:ConfigService)=>({
                transport: `smtps://${configService.get("GOOGLE_ACCOUNT_EMAIL")}:${configService.get("GOOGLE_ACCOUNT_PASSWORD")}@${configService.get("GOOGLE_ACCOUNT_SMTP")}`,
                defaults:{
                    from: `${configService.get("EMAIL_SENDER_NAME")} <${configService.get("NO_REPLY_EMAIL_SENDER")}>`
                },
                template: {
                    dir: process.cwd() + '/templates/html/',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict:true
                    }
                }
            })
        })
    ],
    providers:[
        AwsEmailService,
        GmailEmailService,
        EmailService
    ],
    exports : [EmailService]
})
export class EmailModule{}