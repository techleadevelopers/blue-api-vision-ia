import { Account } from './account/account.model';
import { Theme } from './theme/theme.model';
import { ContentJob, JobStatus } from './job/job.model';
import { Post } from './post/post.model';
import { InsightSnapshot } from './insight/insight.model';

export const CLIPFORGE_REPOSITORY = Symbol('CLIPFORGE_REPOSITORY');

export interface ClipforgeRepository {
  createJob(data: Partial<ContentJob>): Promise<ContentJob>;
  updateJob(id: string, data: Partial<ContentJob>): Promise<ContentJob | null>;
  findJobById(id: string): Promise<ContentJob | null>;
  listJobs(params?: {
    status?: JobStatus;
    themeId?: string;
    accountId?: string;
    limit?: number;
  }): Promise<ContentJob[]>;

  listAccounts(): Promise<Account[]>;
  listThemes(): Promise<Theme[]>;
  updateTheme(id: string, data: Partial<Theme>): Promise<Theme | null>;

  listPosts(filters?: { accountId?: string; rangeDays?: number }): Promise<Post[]>;
  listInsights(filters?: { rangeDays?: number }): Promise<InsightSnapshot[]>;
}
