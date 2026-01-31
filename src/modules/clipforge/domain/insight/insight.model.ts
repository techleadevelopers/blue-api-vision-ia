export interface InsightSnapshot {
  id: string;
  postId: string;
  capturedAt: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  score?: number;
}
