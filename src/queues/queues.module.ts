import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { GameLevelModule } from 'src/gamelevel/gamelevel.module';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
    imports: [
      BullModule.forRoot({
        connection: {
          host: '127.0.0.1',
          port: 6379,
          maxRetriesPerRequest: 1, // Set to null to disable retries
        },
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
