import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Email, EmailService } from "src/shared/services/emails";
import { User } from "../models";

@Injectable()
export class UserEmailService
{
    constructor(private emailService:EmailService,private configService:ConfigService,private jwtService:JwtService){}
    async sendNewUserEmail(user:User)
    {
        return this.emailService.sendTemplateEmail(
            'Welcome',
            this.configService.get<string>("TEAM_EMAIL_SENDER"),
            user.email,
            this.configService.get<string>("EMAIL_TEMPLATE_NEW_REGISTRATION"),
            {
                userEmail: `${user.firstName} ${user.lastName}`,
            }
        );
    }

    async sendConfirmationEmail(user)
    {
        // https://www.y-nkap.com/mail/link-receive?token={token} link email confirmation
        const accessToken = this.jwtService.sign({
            email:user.email,
            permissions:[user.permissions],
            sub:user._id
        })
        return this.emailService.sendTemplateEmail(
            'Account confirm',
            this.configService.get<string>("NO_REPLY_EMAIL_SENDER"),
            user.email,            
            this.configService.get<string>("EMAIL_TEMPLATE_ACCOUNT_CONFIRMATION"),
            {
                userEmail: `${user.firstName} ${user.lastName}`,
                confirmationLink:`${this.configService.get<string>("PUBLIC_FRONTEND_URL")}/mail/link-receive?token=${accessToken}`
            },
        )
        
        
    }

    async sendResetPasswordEmail(user)
    {
        // https://www.y-nkap.com/mail/link-receive?resetTokenPwd={token} reset password email 
        const accessToken = this.jwtService.sign({
            email:user.email,
            permissions:[user.permissions],
            sub:user._id
        })
        return this.emailService.sendTemplateEmail(
            'Password reset',
            this.configService.get<string>("NO_REPLY_EMAIL_SENDER"),
            user.email,            
            this.configService.get<string>("EMAIL_TEMPLATE_RESET_PASSWORD"),
            {
                userEmail: `${user.firstName} ${user.lastName}`,
                resetPwdLink:`${this.configService.get<string>("PUBLIC_FRONTEND_URL")}/mail/link-receive?resetTokenPwd=${accessToken}`
            },
        )
    }
    // async sendTemplateEmail(sender,receiver,template,templateVar)
    // {
    //     return this.emailService.sendEmail(
    //         new Email()
    //         .from(sender)
    //         .to(receiver)
    //         .templateVar(templateVar)
    //         .template(template)
    //     )
    // }
    
}