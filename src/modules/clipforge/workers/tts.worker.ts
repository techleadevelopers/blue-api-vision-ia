import { Process, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClipforgeService } from '../clipforge.service';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { JobStatus } from '../domain/job/job.model';
import { ENV } from '../../../config/env.config';

@Processor(CLIPFORGE_QUEUES.TTS_GENERATE)
export class TtsWorker {
  constructor(private readonly clipforge: ClipforgeService) {}

  @Process({ name: 'tts.generate', concurrency: ENV.CLIPFORGE_CONCURRENCY.TTS })
  async handle(job: Job<{ jobId: string; payload: Record<string, unknown> }>) {
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
