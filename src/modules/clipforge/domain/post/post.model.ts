export interface Post {
  id: string;
  jobId: string;
  platformPostId?: string;
  url?: string;
  caption?: string;
  publishedAt?: Date;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}
