import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './authorization/authorization.module';
import { PermsGuard } from './authorization/guards';
import { GameModule } from './game/game.module';
import { GameLevelModule } from './gamelevel/gamelevel.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    ActivityModule,
    AuthorizationModule,
    GameLevelModule,
    GameModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide:APP_GUARD,
    //   useClass:PermsGuard
    // }
  ],
})
export class AppModule {}
