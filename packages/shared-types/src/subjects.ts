// Re-export Prisma types
export type { subjects as Subject } from '@prisma/client';

// API Request types
export interface CreateSubjectRequest {
  name: string;
  description?: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}
