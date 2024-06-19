import { BadRequestException, Controller, Get, Post,Body, HttpStatus, NotFoundException,ForbiddenException, Req, UseGuards, NotAcceptableException } from "@nestjs/common"
import { Request } from "express";
import { ConfirmationEmailDTO } from "../dtos";
import { UserJwtAuthGuard } from "../guards";
import { UsersService } from "../services";
import { UserEmailService } from "../services/user-email.service";


@Controller("email")
export class EmailConfirmationController
{
    constructor(
        private userEmailService:UserEmailService,
        private userService:UsersService
    ){}

    /**
     * @api {Get} /email/send-confirmation Sending email confirmation link
     * @apiDescription Send the email containing a confirmation link
     * @apiName Send email confirmation link
     * @apiGroup User
     * @apiUse ConfirmEmailDTO
     * @apiSuccess (200 Ok) {Number} statusCode status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiError (Error 4xx) 400-BadRequest User email not supplied
     * @apiUse apiError
     */
    @Post("send-confirmation")
    async sendEmailConfirmation(@Body() emailDTO:ConfirmationEmailDTO)
    {
        let user = await this.userService.findOneByField({"email":emailDTO.email})
        if(!user) throw new NotAcceptableException({
            statusCode: HttpStatus.NOT_ACCEPTABLE,
            error:"NotFound",
            message:["User not found"]
        })
        else if(user.emailConfirmed) throw new ForbiddenException({
            statusCode:HttpStatus.FORBIDDEN,
            error:"EmailConfirmationForbidden",
            message:"The email has already been confirmed"
        })
        
        await this.userEmailService.sendConfirmationEmail(user)
        return {
            statusCode:HttpStatus.OK,
            message:"The new confirmation link has been sent.",
        }
    }

    /**
     * @api {Post} /email/confirm Email confirmation
     * @apiDescription Confirmation de l'email à partir du lien de confirmation
     * @apiName Email confirmation
     * @apiGroup User
     * @apiUse apiSecurity
     * 
     * @apiSuccess (200 Ok) {Number} statusCode status code
     * @apiSuccess (200 Ok) {String} Response Description
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiError (Error 4xx) 404-NotFound User not found
     * @apiError (Error 4xx) 403-EmailConfirmationForbidden The email has already been confirmed
     * @apiUse apiError
     */
    @UseGuards(UserJwtAuthGuard)
    @Post("confirm")
    async confirmEmail(@Req() request:Request)
    {
        let user = await this.userService.findOneByField({"email":request.user["email"]})
        if(!user) throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error:"NotFound",
            message:["User not found"]
        })
        if(user.emailConfirmed) throw new ForbiddenException({
            statusCode:HttpStatus.FORBIDDEN,
            error:"EmailConfirmationForbidden",
            message:"The email has already been confirmed"
        })

        await this.userService.confirmedAccount(user);
        return {
            statusCode:HttpStatus.OK,
            message:"The email has been successfully confirmed",
        }
    }
}