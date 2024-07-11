import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { GameLevelModule } from 'src/gamelevel/gamelevel.module';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
    imports: [
      BullModule.forRoot({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
      BullModule.registerQueue({
        name: 'game-level',
      }),
      forwardRef(() => GameLevelModule),
    ],
    providers: [QueueService, QueueProcessor],
    exports: [QueueService,QueueProcessor],
})
export class QueuesModule {}
