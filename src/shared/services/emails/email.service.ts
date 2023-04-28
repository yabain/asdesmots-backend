import { Injectable } from "@nestjs/common";
import { AwsEmailService } from "./aws-email.service";

import { Email } from "./email";
import { GmailEmailService } from "./gmail-email.service";

@Injectable()
export class EmailService
{
    constructor(
        private awsEmailService:AwsEmailService,
        private gmailEmailService:GmailEmailService
    ){}

    sendEmailWithAwsSES(emailObj:Email)
    {
        return this.awsEmailService.sendEmail(emailObj)
    }

    async sendEmailWithGmail(emailObj:Email)
    {
        return this.gmailEmailService.sendMail(emailObj)
    }

    async sendTemplateEmail(sender,receiver,template,templateVar)
    {
        return this.sendEmailWithGmail(
            new Email()
            .from(sender)
            .to(receiver)
            .templateVar(templateVar)
            .template(template)
        )
    }
}