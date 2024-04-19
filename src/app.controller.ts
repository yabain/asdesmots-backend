import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  
  version = "2.0.0"

  constructor(private configService:ConfigService) {}

  @Get()
  getHello(): string {
    return `AsDesMots API Version ${this.configService.get<string>("NODE_ENV")} ${this.version}`;
  }
}
