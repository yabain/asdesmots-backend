import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnGlobalQueueWaiting, OnQueueActive } from '@nestjs/bull';
import { Job, Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('gameLevel') private readonly gameLevelQueue: Queue) {}

  async addSwapJob(sortGameLevelDTO) {
    try {
      console.log(`Starting to add job...`);
      const result = await this.gameLevelQueue.add('swap', sortGameLevelDTO);
      console.log('Job added successfully:');
    } catch (error) {
      console.error('Error adding job:', error);
    }
  }
}
