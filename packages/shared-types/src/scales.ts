// Re-export Prisma types
export type { scales as Scale } from '@prisma/client';

// API Request types
export interface CreateScaleRequest {
  name: string;
  desc?: string;
  maxVal: bigint | number;
}

export interface UpdateScaleRequest {
  name?: string;
  desc?: string;
  maxVal?: bigint | number;
}
