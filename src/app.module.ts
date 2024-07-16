import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './authorization/authorization.module';
import { GameModule } from './game/game.module';
import { GameLevelModule } from './gamelevel/gamelevel.module';
import { QueuesModule } from './queues/queues.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    ActivityModule,
    AuthorizationModule,
    GameLevelModule,
    GameModule,
    QueuesModule
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
