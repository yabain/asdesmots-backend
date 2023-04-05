import { Injectable } from "@nestjs/common";
import * as JwtBlackListModule from "express-jwt-blacklist";

@Injectable()
export class CustomJwtTokenService
{
    jwtBlackList = JwtBlackListModule.configure({
        tokenId:'iat',
        strict:false
    });
}