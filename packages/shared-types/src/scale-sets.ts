// Re-export Prisma types
import type {
  scale_sets,
  scale_set_scales,
  project_role
} from '@prisma/client';

export type ScaleSet = scale_sets;
export type ScaleSetScale = scale_set_scales;
export type ProjectRole = project_role;

// API Request types
export interface CreateScaleSetRequest {
  name: string;
  year_id: bigint | number;
  project_role: 'supervisor' | 'opponent';
}

export interface UpdateScaleSetRequest {
  name?: string;
  year_id?: bigint | number;
  project_role?: 'supervisor' | 'opponent';
}

export interface AddScaleToSetRequest {
  scale_id: bigint | number;
  weight: number;
  display_order?: number;
}

export interface UpdateScaleInSetRequest {
  weight: number;
  display_order?: number;
}

export interface BulkCloneScaleSetsRequest {
  yearId: bigint | number;
  scaleSetsData: Array<{
    name: string;
    project_role: 'supervisor' | 'opponent';
    scales: Array<{
      scale_id: bigint | number;
      weight: number;
      display_order?: number;
    }>;
  }>;
}

// Extended types with relations
export interface ScaleSetWithScales extends scale_sets {
  scale_set_scales: scale_set_scales[];
}
