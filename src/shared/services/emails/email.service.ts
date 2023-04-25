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

    sendEmailWithAwsSES(emailObj:Email)
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

    async sendEmailWithGmail(emailObj:Email)
    {

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