import { Process, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClipforgeService } from '../clipforge.service';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { JobStatus } from '../domain/job/job.model';
import { ENV } from '../../../config/env.config';

@Processor(CLIPFORGE_QUEUES.POST_QUEUE)
export class PostWorker {
  constructor(private readonly clipforge: ClipforgeService) {}

  @Process({ name: 'post.queue', concurrency: ENV.CLIPFORGE_CONCURRENCY.POST })
  async handle(job: Job<{ jobId: string; payload: Record<string, unknown> }>) {
    try {
      // TODO: integrar SDK das plataformas (TikTok/IG/YouTube) dependendo do account
      await this.clipforge.markStatus(job.data.jobId, JobStatus.PUBLISHED, 'post.published');
      await this.clipforge.enqueueNext(
        job.data.jobId,
        CLIPFORGE_QUEUES.METRICS_PULL,
        job.data.payload,
      );
    } catch (error) {
      await this.clipforge.sendToDeadletter(job.data.jobId, error);
      throw error;
    }
  }
}
