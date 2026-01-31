import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClipforgeService } from '../clipforge.service';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { JobStatus } from '../domain/job/job.model';
import { ENV } from '../../../config/env.config';

@Processor(CLIPFORGE_QUEUES.TTS_GENERATE, {
  concurrency: ENV.CLIPFORGE_CONCURRENCY.TTS,
})
export class TtsWorker extends WorkerHost {
  constructor(private readonly clipforge: ClipforgeService) {
    super();
  }

  async process(job: Job<{ jobId: string; payload: Record<string, unknown> }>) {
    try {
      // TODO: sintetizar áudio e salvar referência na payload
      await this.clipforge.markStatus(job.data.jobId, JobStatus.TTS_READY, 'tts.ready');
      await this.clipforge.enqueueNext(
        job.data.jobId,
        CLIPFORGE_QUEUES.VIDEO_RENDER,
        job.data.payload,
      );
    } catch (error) {
      await this.clipforge.sendToDeadletter(job.data.jobId, error);
      throw error;
    }
  }
}
