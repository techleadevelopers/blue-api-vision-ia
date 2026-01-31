import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClipforgeService } from '../clipforge.service';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { ENV } from '../../../config/env.config';
import { Logger } from '@nestjs/common';

@Processor(CLIPFORGE_QUEUES.METRICS_PULL, {
  concurrency: ENV.CLIPFORGE_CONCURRENCY.METRICS,
})
export class MetricsWorker extends WorkerHost {
  private readonly logger = new Logger(MetricsWorker.name);

  constructor(private readonly clipforge: ClipforgeService) {
    super();
  }

  async process(job: Job<{ postId: string; rangeDays?: number }>) {
    try {
      // TODO: buscar métricas na plataforma e persistir no repositório/Prisma
      this.logger.debug(
        `Mock metrics collection for post ${job.data.postId} (range ${job.data.rangeDays}d)`,
      );
    } catch (error) {
      await this.clipforge.sendToDeadletter(job.data.postId, error);
      throw error;
    }
  }
}
