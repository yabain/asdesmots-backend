import { Injectable } from "@nestjs/common";
import { SES } from "aws-sdk";
import { InjectAwsService } from "nest-aws-sdk";
import { Email } from "./email";

@Injectable()
export class EmailService
{
    constructor(
        @InjectAwsService(SES) private awsEmailService:SES
    ){}

    sendEmail(emailObj:Email)
    {
        let email=emailObj.toJSON();
        let params = {
            Source:email.from.toString(),
            Destination:{
                ToAddresses:email.to,
            },
            Message:{
                Subject: { Data: email.subject},
                Body: { Text: { Data: email.content} }
            },
            Template:"",
            TemplateData:""
        };

        if(!email.template) {
            delete params.Template;
            delete params.TemplateData;
            return this.awsEmailService.sendEmail(params).promise()
        }
        
        params.Template = email.template;
        params.TemplateData=JSON.stringify(email.templateVar);
        delete params.Message;

        return this.awsEmailService.sendTemplatedEmail(params).promise()

    }

    async sendTemplateEmail(sender,receiver,template,templateVar)
    {
        return this.sendEmail(
            new Email()
            .from(sender)
            .to(receiver)
            .templateVar(templateVar)
            .template(template)
        )
    }
}