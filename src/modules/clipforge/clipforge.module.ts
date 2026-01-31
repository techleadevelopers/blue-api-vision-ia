import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ClipforgeController } from './clipforge.controller';
import { ClipforgeService } from './clipforge.service';
import { CLIPFORGE_QUEUE_LIST } from './queues/clipforge.queues';
import { InMemoryClipforgeRepository } from './domain/in-memory.repository';
import { CLIPFORGE_REPOSITORY } from './domain/clipforge.repository';
import { ScriptWorker } from './workers/script.worker';
import { TtsWorker } from './workers/tts.worker';
import { RenderWorker } from './workers/render.worker';
import { PostWorker } from './workers/post.worker';
import { MetricsWorker } from './workers/metrics.worker';
import { RenderService } from './ffmpeg/render.service';
import { ClipforgeStorageService } from './storage/storage.service';
import { ENV } from '../../config/env.config';

@Module({
  imports: [
    BullModule.forRoot({
      connection: { url: ENV.REDIS_URL },
      prefix: ENV.BULLMQ_PREFIX,
    }),
    BullModule.registerQueue(...CLIPFORGE_QUEUE_LIST.map((name) => ({ name }))),
  ],
  controllers: [ClipforgeController],
  providers: [
    ClipforgeService,
    RenderService,
    ClipforgeStorageService,
    ScriptWorker,
    TtsWorker,
    RenderWorker,
    PostWorker,
    MetricsWorker,
    {
      provide: CLIPFORGE_REPOSITORY,
      useClass: InMemoryClipforgeRepository,
    },
  ],
})
export class ClipforgeModule {}
