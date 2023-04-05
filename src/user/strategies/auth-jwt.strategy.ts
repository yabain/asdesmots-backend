import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JWT_CONSTANT } from "src/shared/config";

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy)
{
    constructor()
    {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_CONSTANT.secret,
            
        })
    }

    async validate(payload:Record<string,any>)
    {
        return {email:payload.email, roles:payload.roles,userId:payload.sub}
    }
}