import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { GameLevelModule } from 'src/gamelevel/gamelevel.module';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';
import { ConfigModule, ConfigService } from "@nestjs/config";


@Module({
    imports: [
      BullModule.forRootAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory: (configService:ConfigService)=>({
          connection: {
            host: configService.get("REDIS_HOST"),
            port: configService.get("REDIS_PORT"),
            maxRetriesPerRequest: 3, // Set to null to disable retries
          },
        }),
      }),
      BullModule.registerQueue({
        name: 'gameLevel',
      }),
      forwardRef(() => GameLevelModule),
    ],
    providers: [QueueService,QueueProcessor],
    exports: [QueueService]
})
export class QueuesModule {}
