export interface Theme {
  id: string;
  name: string;
  niche?: string;
  avatar?: string;
  promise?: string;
  hooks: string[];
  ctas: string[];
  voices: string[];
  templates: string[];
  forbiddenWords: string[];
  rules?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
