import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('game-level') private readonly gameLevelQueue: Queue) {}

  async addSwapJob(oldLevelPosition: Number, newLevelPosition: Number) {
    await this.gameLevelQueue.add({ oldLevelPosition, newLevelPosition });
  }
}
