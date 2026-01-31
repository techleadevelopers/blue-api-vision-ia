import {
  Injectable,
  Logger,
  Inject,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions, JobStatus as BullJobStatus } from 'bullmq';
import { CLIPFORGE_QUEUES, ClipforgeQueueName } from './queues/clipforge.queues';
import {
  ClipforgeRepository,
  CLIPFORGE_REPOSITORY,
} from './domain/clipforge.repository';
import { ContentJob, JobStatus } from './domain/job/job.model';
import { ENV } from '../../config/env.config';

export interface GenerateRequestDto {
  accountId: string;
  themeId: string;
  hook?: string;
  template?: string;
  voice?: string;
  extras?: Record<string, unknown>;
  adminToken?: string;
}

@Injectable()
export class ClipforgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClipforgeService.name);
  private metricsInterval?: NodeJS.Timeout;

  constructor(
    @InjectQueue(CLIPFORGE_QUEUES.SCRIPT_GENERATE)
    private readonly scriptQueue: Queue,
    @InjectQueue(CLIPFORGE_QUEUES.TTS_GENERATE)
    private readonly ttsQueue: Queue,
    @InjectQueue(CLIPFORGE_QUEUES.VIDEO_RENDER)
    private readonly renderQueue: Queue,
    @InjectQueue(CLIPFORGE_QUEUES.POST_QUEUE)
    private readonly postQueue: Queue,
    @InjectQueue(CLIPFORGE_QUEUES.METRICS_PULL)
    private readonly metricsQueue: Queue,
    @InjectQueue(CLIPFORGE_QUEUES.DEADLETTER)
    private readonly deadletterQueue: Queue,
    @Inject(CLIPFORGE_REPOSITORY)
    private readonly repository: ClipforgeRepository,
  ) {}

  onModuleInit() {
    // Scheduler: de 30 em 30 minutos, enfileira coleta de métricas dos últimos 7 dias
    this.metricsInterval = setInterval(
      () => this.enqueueMetricsForRecentPosts(7),
      1000 * 60 * 30,
    );
  }

  onModuleDestroy() {
    if (this.metricsInterval) clearInterval(this.metricsInterval);
  }

  private jobOptions(): JobsOptions {
    return {
      removeOnComplete: 1000,
      removeOnFail: 1000,
    };
  }

  async generate(request: GenerateRequestDto): Promise<ContentJob> {
    const payload = {
      hook: request.hook,
      template: request.template,
      voice: request.voice,
      themeId: request.themeId,
      accountId: request.accountId,
      extras: request.extras,
    };

    const job = await this.repository.createJob({
      accountId: request.accountId,
      themeId: request.themeId,
      payload,
      status: JobStatus.CREATED,
      step: 'script.generate',
    });

    await this.scriptQueue.add(
      'script.generate',
      { jobId: job.id, payload },
      this.jobOptions(),
    );

    return job;
  }

  async retryJob(id: string): Promise<ContentJob> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException('Job not found');

    const queue = this.resolveQueueForStatus(job.status) ?? this.scriptQueue;
    await queue.add('retry', { jobId: job.id, payload: job.payload }, this.jobOptions());
    await this.repository.updateJob(id, { attempts: (job.attempts ?? 0) + 1 });
    return job;
  }

  async cancelJob(id: string): Promise<ContentJob> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException('Job not found');
    const cancelled = await this.repository.updateJob(id, { status: JobStatus.FAILED, step: 'cancelled' });
    return cancelled || job;
  }

  async listQueues() {
    const queues = this.getQueues();
    const result = [];
    for (const { name, queue } of queues) {
      const counts = await queue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed',
      );
      result.push({ name, counts });
    }
    return result;
  }

  async pauseQueue(name: ClipforgeQueueName) {
    const queue = this.getQueueByName(name);
    await queue.pause();
  }

  async resumeQueue(name: ClipforgeQueueName) {
    const queue = this.getQueueByName(name);
    await queue.resume();
  }

  async listJobs(params: {
    queue?: ClipforgeQueueName;
    status?: BullJobStatus | 'failed' | 'completed' | 'waiting';
  }) {
    if (params.queue) {
      const queue = this.getQueueByName(params.queue);
      const status = params.status || 'waiting';
      return queue.getJobs([status as BullJobStatus], 0, 50);
    }
    return this.repository.listJobs();
  }

  async listAccounts() {
    return this.repository.listAccounts();
  }

  async listPosts(accountId?: string, range?: number) {
    return this.repository.listPosts({
      accountId,
      rangeDays: range,
    });
  }

  async listInsights(range?: number) {
    return this.repository.listInsights({ rangeDays: range });
  }

  async listThemes() {
    return this.repository.listThemes();
  }

  async updateTheme(id: string, data: Record<string, unknown>) {
    const updated = await this.repository.updateTheme(id, data);
    if (!updated) throw new NotFoundException('Theme not found');
    return updated;
  }

  async markStatus(jobId: string, status: JobStatus, step?: string) {
    const updated = await this.repository.updateJob(jobId, { status, step });
    if (!updated) this.logger.warn(`Job ${jobId} not found when marking status ${status}`);
    return updated;
  }

  async enqueueNext(jobId: string, nextQueue?: ClipforgeQueueName, payload?: Record<string, unknown>) {
    if (!nextQueue) return;
    const queue = this.getQueueByName(nextQueue);
    await queue.add('continue', { jobId, payload }, this.jobOptions());
  }

  async sendToDeadletter(jobId: string, error: unknown) {
    await this.deadletterQueue.add(
      'deadletter',
      { jobId, error: String(error) },
      this.jobOptions(),
    );
    await this.repository.updateJob(jobId, { status: JobStatus.FAILED, error: String(error) });
  }

  async enqueueMetricsForRecentPosts(rangeDays = 7) {
    const posts = await this.repository.listPosts(undefined, rangeDays);
    for (const post of posts) {
      await this.metricsQueue.add(
        'metrics.pull',
        { postId: post.id, rangeDays },
        this.jobOptions(),
      );
    }
  }

  private resolveQueueForStatus(status: JobStatus): Queue | null {
    switch (status) {
      case JobStatus.CREATED:
      case JobStatus.SCRIPT_READY:
        return this.scriptQueue;
      case JobStatus.TTS_READY:
        return this.ttsQueue;
      case JobStatus.RENDER_READY:
        return this.renderQueue;
      case JobStatus.READY_TO_POST_MANUAL:
        return this.postQueue;
      default:
        return this.scriptQueue;
    }
  }

  private getQueueByName(name: ClipforgeQueueName): Queue {
    const match = this.getQueues().find((q) => q.name === name);
    if (!match) throw new NotFoundException(`Queue ${name} not registered`);
    return match.queue;
  }

  private getQueues(): { name: ClipforgeQueueName; queue: Queue }[] {
    return [
      { name: CLIPFORGE_QUEUES.SCRIPT_GENERATE, queue: this.scriptQueue },
      { name: CLIPFORGE_QUEUES.TTS_GENERATE, queue: this.ttsQueue },
      { name: CLIPFORGE_QUEUES.VIDEO_RENDER, queue: this.renderQueue },
      { name: CLIPFORGE_QUEUES.POST_QUEUE, queue: this.postQueue },
      { name: CLIPFORGE_QUEUES.METRICS_PULL, queue: this.metricsQueue },
      { name: CLIPFORGE_QUEUES.DEADLETTER, queue: this.deadletterQueue },
    ];
  }
}
