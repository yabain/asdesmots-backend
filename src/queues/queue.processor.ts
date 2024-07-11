import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { GameLevelService } from 'src/gamelevel/services'; 
import { Job } from 'bullmq';
import { Process } from '@nestjs/bull';
import { SortGameLevelDTO } from 'src/gamelevel/dtos';

@Injectable()
@Processor('gameLevel')
export class QueueProcessor extends WorkerHost {
  constructor(
    @Inject(forwardRef(() => GameLevelService))
    private readonly gameLevelService: GameLevelService
  ) { 
    super();
  }
  
  async process(job: Job<SortGameLevelDTO[]>): Promise<any> {
    
    if (job.name === 'swap') {
      const jobData = job.data;
      for(let srtItem of jobData) {
        // Get item's current level positions
        const changingElem = await this.gameLevelService.findOneByField({ _id: srtItem.id });
        await this.gameLevelService.swapLevels(changingElem.level, srtItem.level);
      }
    } else {
      console.log(`Unknown job type: ${job.name}`);
    }
  }
  
  @OnWorkerEvent('completed')
  onCompleted() {
    console.log('All queues tasks successfully executed');
  }
}