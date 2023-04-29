import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";
import { Options } from "nodemailer/lib/smtp-transport";
import { Email } from "./email";

@Injectable()
export class GmailEmailService
{
    constructor(
        private configService:ConfigService,
        private mailerService:MailerService
    ){}

    private async setTransport()
    {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            this.configService.get("GOOGLE_API_CLIENTID"),
            this.configService.get("GOOGLE_API_SECRET_KEY"),
            this.configService.get("GOOGLE_API_URL_PLAYGROUND") 
        )  
        oauth2Client.setCredentials({refresh_token:this.configService.get("GOOGLE_API_REFRESH_CODE")});
        const accessToken:string = await new Promise((resolve,reject)=>{
            oauth2Client.getAccessToken((err,token)=>{
                if(err) return  reject("Failed to get access token")
                resolve(token)
            })
        })

        const config:Options = {
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: this.configService.get("GOOGLE_ACCOUNT_EMAIL"),
                clientId: this.configService.get("GOOGLE_API_CLIENTID"),
                clientSecret: this.configService.get("GOOGLE_API_SECRET_KEY"),
                accessToken
            }
        }

        this.mailerService.addTransporter('gmail',config);
    }

    async sendMail(emailObj:Email)
    {
        let email=emailObj.toJSON();

        await this.setTransport();
        return this.mailerService.sendMail({
            transporterName:'gmail',
            to: email.to,
            from: this.configService.get("NO_REPLY_EMAIL_SENDER"),
            subject:email.subject,
            template:email.template,
            context: email.templateVar
        })
    }
}