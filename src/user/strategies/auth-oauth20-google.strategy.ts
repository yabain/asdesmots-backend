import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
// import { OAuth2Client } from "google-auth-library";
import { Strategy, VerifyCallback } from "passport-google-oauth2";

@Injectable()
export class AuthOAuth20GoogleStrategy {
    // private authClient = new OAuth2Client(this.configService.get("GOOGLE_API_CLIENTID"), this.configService.get("GOOGLE_API_SECRET_KEY"));
    constructor(
        private configService: ConfigService
    ){
      
    }

    async validateUserToken(userToken:string):Promise<any>
    {
        // return  this.authClient.verifyIdToken({
        //         idToken:userToken,
        //         audience: this.configService.get('GOOGLE_API_CLIENTID')
        //     })
            
    }
}