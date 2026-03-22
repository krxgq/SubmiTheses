// Re-export Prisma types
export type { grades as Grade } from '@prisma/client';

// API Request types
export interface CreateGradeRequest {
  reviewer_id: string;
  value: bigint | number;
  year_id: bigint | number;
  scale_id?: bigint | number;
}

export interface UpdateGradeRequest {
  value: bigint | number;
  scale_id?: bigint | number;
}
