export interface Account {
  id: string;
  name: string;
  platform: string;
  status: string;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
