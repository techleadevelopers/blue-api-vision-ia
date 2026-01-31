export enum JobStatus {
  CREATED = 'CREATED',
  SCRIPT_READY = 'SCRIPT_READY',
  TTS_READY = 'TTS_READY',
  RENDER_READY = 'RENDER_READY',
  READY_TO_POST_MANUAL = 'READY_TO_POST_MANUAL',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

export interface ContentJobPayload {
  hook?: string;
  template?: string;
  voice?: string;
  themeId?: string;
  accountId?: string;
  extras?: Record<string, unknown>;
}

export interface ContentJob {
  id: string;
  accountId: string;
  themeId: string;
  status: JobStatus;
  step?: string;
  payload?: ContentJobPayload;
  error?: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
