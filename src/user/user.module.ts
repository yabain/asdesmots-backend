import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController,EmailConfirmationController, UserProfilController, UsersController } from "./controllers";
import { User, UserSchema } from "./models";
import { AuthService, UsersService } from "./services";
import { AuthLocalStrategy, AuthOAuth20GoogleStrategy } from "./strategies";
import { PasswordUtil } from "./utils";
import { JWT_CONSTANT } from "src/shared/config";
import { AuthJwtStrategy } from "./strategies/auth-jwt.strategy";
import { SharedModule } from "src/shared/shared.module";
import { UserEmailService } from "./services/user-email.service";
import { EmailConfirmedGuard,AccountStatusGuard } from "./guards";
import { ActivityModule } from "src/activity/activity.module";
import { UniqueValidator } from "src/shared/helpers/unique-validator";
import { JsonResponse } from "src/shared/helpers/json-response";


@Module({
    imports:[
        MongooseModule.forFeatureAsync([
        {
            name:User.name,
            useFactory: ()=>{
                const schema = UserSchema
                schema.pre("save",function (next){
                    this.password=PasswordUtil.hash(this.password)
                    next();
                })
               
                return schema;
            }
        }]),
        PassportModule,
        JwtModule.register({
            secret:JWT_CONSTANT.secret,
            signOptions: { expiresIn: JWT_CONSTANT.expiresIn }
        }),
        SharedModule,
        ActivityModule
    ],
    controllers:[
        AuthController,
        EmailConfirmationController,
        UserProfilController,
        UsersController
    ],
    providers:[
        UsersService,
        AuthService,
        AuthLocalStrategy,
        AuthJwtStrategy,
        AuthOAuth20GoogleStrategy,
        UserEmailService,
        EmailConfirmedGuard,
        AccountStatusGuard,
        UniqueValidator,
        JsonResponse
    ],
    exports:[
        UsersService,
        AuthService,
        AuthJwtStrategy,
        AuthOAuth20GoogleStrategy,
        JwtModule,
        UserEmailService,
        EmailConfirmedGuard,
        AccountStatusGuard
    ]
})
export class UserModule{}