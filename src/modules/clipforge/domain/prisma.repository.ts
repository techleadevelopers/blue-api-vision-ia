import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ClipforgeRepository,
} from './clipforge.repository';
import { Account } from './account/account.model';
import { Theme } from './theme/theme.model';
import { ContentJob, JobStatus } from './job/job.model';
import { Post } from './post/post.model';
import { InsightSnapshot } from './insight/insight.model';

@Injectable()
export class PrismaClipforgeRepository implements ClipforgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(data: Partial<ContentJob>): Promise<ContentJob> {
    const created = await this.prisma.contentJob.create({
      data: {
        accountId: data.accountId!,
        themeId: data.themeId!,
        status: data.status || JobStatus.CREATED,
        step: data.step,
        payload: data.payload as any,
        error: data.error,
        attempts: data.attempts ?? 0,
      },
    });
    return created as unknown as ContentJob;
  }

  async updateJob(id: string, data: Partial<ContentJob>): Promise<ContentJob | null> {
    try {
      const updated = await this.prisma.contentJob.update({
        where: { id },
        data: {
          status: data.status,
          step: data.step,
          payload: data.payload as any,
          error: data.error,
          attempts: data.attempts,
        },
      });
      return updated as unknown as ContentJob;
    } catch {
      return null;
    }
  }

  async findJobById(id: string): Promise<ContentJob | null> {
    return (await this.prisma.contentJob.findUnique({ where: { id } })) as
      | ContentJob
      | null;
  }

  async listJobs(params?: {
    status?: JobStatus;
    themeId?: string;
    accountId?: string;
    limit?: number;
  }): Promise<ContentJob[]> {
    return (await this.prisma.contentJob.findMany({
      where: {
        status: params?.status,
        themeId: params?.themeId,
        accountId: params?.accountId,
      },
      take: params?.limit || 50,
      orderBy: { createdAt: 'desc' },
    })) as ContentJob[];
  }

  async listAccounts(): Promise<Account[]> {
    return (await this.prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    })) as Account[];
  }

  async listThemes(): Promise<Theme[]> {
    return (await this.prisma.theme.findMany({
      orderBy: { createdAt: 'desc' },
    })) as Theme[];
  }

  async updateTheme(id: string, data: Partial<Theme>): Promise<Theme | null> {
    try {
      const updated = await this.prisma.theme.update({
        where: { id },
        data: {
          name: data.name,
          niche: data.niche,
          avatar: data.avatar,
          promise: data.promise,
          hooks: data.hooks,
          ctas: data.ctas,
          voices: data.voices,
          templates: data.templates,
          forbiddenWords: data.forbiddenWords,
          rules: data.rules as any,
        },
      });
      return updated as unknown as Theme;
    } catch {
      return null;
    }
  }

  async listPosts(filters?: { accountId?: string; rangeDays?: number }): Promise<Post[]> {
    return (await this.prisma.post.findMany({
      where: {
        job: filters?.accountId
          ? { accountId: filters.accountId }
          : undefined,
        createdAt: filters?.rangeDays
          ? { gte: new Date(Date.now() - filters.rangeDays * 86400000) }
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    })) as Post[];
  }

  async listInsights(filters?: { rangeDays?: number }): Promise<InsightSnapshot[]> {
    return (await this.prisma.insightSnapshot.findMany({
      where: filters?.rangeDays
        ? { capturedAt: { gte: new Date(Date.now() - filters.rangeDays * 86400000) } }
        : undefined,
      orderBy: { capturedAt: 'desc' },
    })) as InsightSnapshot[];
  }
}
