import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from "../services";
import { User } from "../models";
import { LoginUserDTO } from "../dtos";

@Injectable()
export class AuthLocalStrategy extends PassportStrategy(Strategy)
{
    constructor(private authService: AuthService)
    {
        super({usernameField:"email"});
    }

    async validate(username:string,password:string):Promise<any>
    {
        let userLoginDTO = new LoginUserDTO()
        userLoginDTO.email=username;
        userLoginDTO.password=password;

        const user = await this.authService.validateUser(userLoginDTO)
        if(!user) throw new UnauthorizedException({
            statusCode:HttpStatus.UNAUTHORIZED,
            error:'Authentification error',
            message:['Email/password incorrect']
        });
        return user;
    }
}