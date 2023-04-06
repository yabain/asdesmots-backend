import { BadRequestException, ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginTelUserDTO } from "../dtos";
import { LoginUserDTO } from "../dtos/login-user.dto";
import { AUTH_TYPE } from "../enums";
import { UserSchema } from "../models";
import { AuthOAuth20GoogleStrategy } from "../strategies/auth-oauth20-google.strategy";
import { PasswordUtil } from "../utils";
import { UsersService } from "./users.service";

@Injectable()
export class AuthService
{
  constructor(private usersService:UsersService, private jwtService:JwtService, 
    private authOAuthGoogleStrategy:AuthOAuth20GoogleStrategy){}

  async validateUser(loginUserDTO:LoginUserDTO)
  {
    const user = await this.usersService.findOneByField({email:loginUserDTO.email,authType:AUTH_TYPE.EMAIL_PASSWORD});
    if(user && PasswordUtil.compare(user.password,loginUserDTO.password)) return user;

    return null;
  }

  login(user,field:string="Email")
  {
    if(user.isDeleted) throw new UnauthorizedException({
      statusCode:HttpStatus.UNAUTHORIZED,
      error:'Authentification error',
      message:[`${field}/password incorrect`]
    });

    if(user.isDisabled) throw new ForbiddenException({
      statusCode:HttpStatus.FORBIDDEN,
      error:'Authentication blocked',
      message:["Account Disabled. Contact Support"]
  });
    const payload = {email:user.email, roles:user.roles,sub:user._id}
    return {
        access_token: this.jwtService.sign(payload)
    }
  }


  async googleLogin(token:string)
  {

    let ticket =null;

    try {
      ticket = await this.authOAuthGoogleStrategy.validateUserToken(token);
      console.log("Tiket ",ticket)
    } catch (error) {
      console.log('Error ',error);
      throw new BadRequestException({
        statusCode:HttpStatus.BAD_REQUEST,
        error:'Authentication Error',
        message:["Google account not found"]
      });
    }

    let userFound = await this.usersService.findOneByField({email:ticket.email,authType:AUTH_TYPE.GOOGLE_ACCOUNT});
    
    if(!userFound) userFound = await this.usersService.create({
      email:ticket.email,
      firstName:ticket.given_name,
      lastName:ticket.family_name,
      profilePicture:ticket.picture,
      emailConfirmed:true,
      authType:AUTH_TYPE.GOOGLE_ACCOUNT
    });

    return {
      user:userFound,
      ...this.login(userFound)
    };

  }

  async telLogin(userLogin:LoginTelUserDTO)
  {

    const user = await this.usersService.findOneByField({phoneNumber:userLogin.phoneNumber,authType:AUTH_TYPE.EMAIL_PASSWORD});
    if(!user) throw new UnauthorizedException({
      statusCode:HttpStatus.UNAUTHORIZED,
      error:'Authentification error',
      message:['Tel/password incorrect']
    });
    if(!PasswordUtil.compare(user.password,userLogin.password)) throw new UnauthorizedException({
      statusCode:HttpStatus.UNAUTHORIZED,
      error:'Authentification error',
      message:['Tel/password incorrect']
    });

    return {
      user,
      ...this.login(user,"Tel")
    };

  }
}