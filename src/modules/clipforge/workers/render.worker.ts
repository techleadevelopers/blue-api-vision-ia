import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CLIPFORGE_QUEUES } from '../queues/clipforge.queues';
import { ClipforgeService } from '../clipforge.service';
import { JobStatus } from '../domain/job/job.model';
import { ENV } from '../../../config/env.config';
import { RenderService } from '../ffmpeg/render.service';

@Processor(CLIPFORGE_QUEUES.VIDEO_RENDER, {
  concurrency: ENV.CLIPFORGE_CONCURRENCY.RENDER,
})
export class RenderWorker extends WorkerHost {
  constructor(
    private readonly clipforge: ClipforgeService,
    private readonly renderService: RenderService,
  ) {
    super();
  }

  async process(job: Job<{ jobId: string; payload: Record<string, unknown> }>) {
    try {
      const result = await this.renderService.renderVideo(job.data.payload);
      const nextStatus =
        ENV.PUBLISH_MODE === 'api'
          ? JobStatus.RENDER_READY
          : JobStatus.READY_TO_POST_MANUAL;

      await this.clipforge.markStatus(job.data.jobId, nextStatus, 'render.ready');

      if (ENV.PUBLISH_MODE === 'api') {
        await this.clipforge.enqueueNext(
          job.data.jobId,
          CLIPFORGE_QUEUES.POST_QUEUE,
          { ...job.data.payload, videoUrl: result.videoUrl },
        );
      }
    } catch (error) {
      await this.clipforge.sendToDeadletter(job.data.jobId, error);
      throw error;
    }
  }
}
