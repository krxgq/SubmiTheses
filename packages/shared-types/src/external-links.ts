// Re-export Prisma types
export type { external_links as ExternalLink } from '@prisma/client';

// API Request types
export interface CreateExternalLinkRequest {
  url: string;
  title: string;
  description?: string;
}

export interface UpdateExternalLinkRequest {
  url?: string;
  title?: string;
  description?: string;
}
