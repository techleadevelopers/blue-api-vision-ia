import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { ClipforgeService } from '../clipforge.service';
import { JobStatus } from '../domain/job/job.model';
import { ENV } from '../../../config/env.config';

@Processor(CLIPFORGE_QUEUES.SCRIPT_GENERATE, {
  concurrency: ENV.CLIPFORGE_CONCURRENCY.SCRIPT,
})
export class ScriptWorker extends WorkerHost {
  constructor(private readonly clipforge: ClipforgeService) {
    super();
  }

  async process(job: Job<{ jobId: string; payload: Record<string, unknown> }>) {
    try {
      // TODO: gerar script com LLM/templating usando payload/theme
      await this.clipforge.markStatus(job.data.jobId, JobStatus.SCRIPT_READY, 'script.ready');
      await this.clipforge.enqueueNext(
        job.data.jobId,
        CLIPFORGE_QUEUES.TTS_GENERATE,
        job.data.payload,
      );
    } catch (error) {
      await this.clipforge.sendToDeadletter(job.data.jobId, error);
      throw error;
    }
  }
}
