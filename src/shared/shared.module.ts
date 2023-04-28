import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { S3, SES } from "aws-sdk";
import { AwsSdkModule } from "nest-aws-sdk";
import configuration from "./config/configuration";
import { SecurityModule } from "./security/security.module";
import { EmailModule, EmailService } from "./services/emails";

@Module({
    imports:[
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal:true
          }),
          MongooseModule.forRootAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory:async (configService:ConfigService)=>({
              uri:configService.get<string>("mongoURI")
            })
          }),
        SecurityModule,
        AwsSdkModule.forRootAsync({
          defaultServiceOptions:{
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory:async (configService:ConfigService)=>({
              region:configService.get<string>("AWS_SDK_REGION"),
              // profile:configService.get<string>("AWS_SDK_PROFILE"),
              credentials:{
                accessKeyId: configService.get<string>("AWS_SDK_ACCESS_KEY"),

                secretAccessKey: configService.get<string>("AWS_SDK_SECRET_KEY")
              }
              
              
            })
          },
          services:[
            SES,
            S3
          ],          
        }),
        EmailModule
    ],
    providers:[
      // EmailService,
      
    ],
    exports:[
        SecurityModule,
        ConfigModule,
        MongooseModule,
        AwsSdkModule,
        // EmailService
    ]
})
export class SharedModule{}