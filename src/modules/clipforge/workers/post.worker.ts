import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClipforgeService } from '../clipforge.service';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { JobStatus } from '../domain/job/job.model';
import { ENV } from '../../../config/env.config';

@Processor(CLIPFORGE_QUEUES.POST_QUEUE, {
  concurrency: ENV.CLIPFORGE_CONCURRENCY.POST,
})
export class PostWorker extends WorkerHost {
  constructor(private readonly clipforge: ClipforgeService) {
    super();
  }

  async process(job: Job<{ jobId: string; payload: Record<string, unknown> }>) {
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
