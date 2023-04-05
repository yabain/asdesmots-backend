import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AuthOAuth20GoogleGuard extends AuthGuard('google'){
    constructor()
    {
        super({
            accessType:'offline'
        })
    }
}