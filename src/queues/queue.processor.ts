import { Processor, Process } from '@nestjs/bull';
import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { GameLevelService } from 'src/gamelevel/services'; 

@Injectable()
@Processor('game-level')
export class QueueProcessor {
  constructor(
    @Inject(forwardRef(() => GameLevelService))
    private readonly gameLevelService: GameLevelService
  ) { }

  @Process('game-level-swap')
  handleTask(job: Job<{ oldLevelPosition: Number, newLevelPosition: Number }>) {
    const { oldLevelPosition, newLevelPosition } = job.data;
    console.log(`Swapping levels: ${oldLevelPosition} with ${newLevelPosition}`);
    this.gameLevelService.swapLevels(oldLevelPosition, newLevelPosition);
  }
}