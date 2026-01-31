import { ClipforgeRepository } from './clipforge.repository';
import { Account } from './account/account.model';
import { Theme } from './theme/theme.model';
import { ContentJob, JobStatus } from './job/job.model';
import { Post } from './post/post.model';
import { InsightSnapshot } from './insight/insight.model';

const now = () => new Date();

export class InMemoryClipforgeRepository implements ClipforgeRepository {
  private themes: Theme[] = [
    {
      id: crypto.randomUUID(),
      name: 'Finanças Rápidas',
      niche: 'finanças pessoais',
      avatar: '💰',
      promise: 'Clareza financeira em 60s',
      hooks: ['Pare de perder dinheiro no banco', '3 erros que te fazem pobre'],
      ctas: ['Salve para aplicar hoje', 'Compartilhe com quem precisa'],
      voices: ['masculina_calma', 'feminina_energetica'],
      templates: ['quadros_slide', 'facecam_com_overlay'],
      forbiddenWords: ['garantia', 'enriqueça rápido'],
      rules: { tone: 'didático direto', duration: '45s' },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Saúde & Lifestyle',
      niche: 'bem-estar',
      avatar: '🌿',
      promise: 'Hábitos simples para viver melhor',
      hooks: ['1 hábito noturno muda seu dia', 'A vitamina que você esquece'],
      ctas: ['Teste por 7 dias', 'Marca um amigo que precisa'],
      voices: ['neutra_suave'],
      templates: ['broll_rapid', 'checklist_vertical'],
      forbiddenWords: ['cura', 'garantia médica'],
      rules: { tone: 'leve', duration: '40s' },
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  private accounts: Account[] = [
    {
      id: 'demo-account',
      name: 'Conta Demo',
      platform: 'tiktok',
      status: 'active',
      config: {},
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  private jobs: ContentJob[] = [];
  private posts: Post[] = [];
  private insights: InsightSnapshot[] = [];

  async createJob(data: Partial<ContentJob>): Promise<ContentJob> {
    const job: ContentJob = {
      id: data.id || crypto.randomUUID(),
      accountId: data.accountId || 'unknown-account',
      themeId: data.themeId || 'unknown-theme',
      status: data.status || JobStatus.CREATED,
      step: data.step,
      payload: data.payload,
      error: data.error,
      attempts: data.attempts ?? 0,
      createdAt: now(),
      updatedAt: now(),
    };
    this.jobs.unshift(job);
    return job;
  }

  async updateJob(id: string, data: Partial<ContentJob>): Promise<ContentJob | null> {
    const idx = this.jobs.findIndex((job) => job.id === id);
    if (idx === -1) return null;
    const current = this.jobs[idx];
    const updated: ContentJob = { ...current, ...data, updatedAt: now() };
    this.jobs[idx] = updated;
    return updated;
  }

  async findJobById(id: string): Promise<ContentJob | null> {
    return this.jobs.find((job) => job.id === id) || null;
  }

  async listJobs(params?: {
    status?: JobStatus;
    themeId?: string;
    accountId?: string;
    limit?: number;
  }): Promise<ContentJob[]> {
    const { status, themeId, accountId, limit } = params || {};
    let filtered = this.jobs;
    if (status) filtered = filtered.filter((job) => job.status === status);
    if (themeId) filtered = filtered.filter((job) => job.themeId === themeId);
    if (accountId) filtered = filtered.filter((job) => job.accountId === accountId);
    return filtered.slice(0, limit || 50);
  }

  async listAccounts(): Promise<Account[]> {
    return this.accounts;
  }

  async listThemes(): Promise<Theme[]> {
    return this.themes;
  }

  async updateTheme(id: string, data: Partial<Theme>): Promise<Theme | null> {
    const idx = this.themes.findIndex((theme) => theme.id === id);
    if (idx === -1) return null;
    const next: Theme = { ...this.themes[idx], ...data, updatedAt: now() };
    this.themes[idx] = next;
    return next;
  }

  async listPosts(filters?: { accountId?: string; rangeDays?: number }): Promise<Post[]> {
    const { accountId, rangeDays } = filters || {};
    let filtered = this.posts;
    if (accountId) {
      const jobIds = this.jobs.filter((j) => j.accountId === accountId).map((j) => j.id);
      filtered = filtered.filter((p) => jobIds.includes(p.jobId));
    }
    if (rangeDays) {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - rangeDays);
      filtered = filtered.filter((p) => p.createdAt >= limitDate);
    }
    return filtered;
  }

  async listInsights(filters?: { rangeDays?: number }): Promise<InsightSnapshot[]> {
    const { rangeDays } = filters || {};
    let filtered = this.insights;
    if (rangeDays) {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - rangeDays);
      filtered = filtered.filter((i) => i.capturedAt >= limitDate);
    }
    return filtered;
  }
}
