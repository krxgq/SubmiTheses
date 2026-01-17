import { apiRequest } from './client';
import type { Scale } from './scales';

// ScaleSet interface matching database schema with relations
export interface ScaleSet {
  id: bigint;
  name: string;
  year_id: bigint;
  project_role: 'supervisor' | 'opponent';
  created_at: string;
  scale_set_scales?: ScaleSetScale[];
  years?: {
    id: bigint;
    name: string;
  };
  _count?: {
    scale_set_scales: number;
  };
}

// Scale within a scale set (junction table)
export interface ScaleSetScale {
  id: bigint;
  scale_set_id: bigint;
  scale_id: bigint;
  weight: number;
  display_order?: number;
  created_at: string;
  scales: Scale;
}

// Request interfaces
export interface CreateScaleSetRequest {
  name: string;
  year_id: bigint;
  project_role: 'supervisor' | 'opponent';
}

export interface UpdateScaleSetRequest {
  name?: string;
  year_id?: bigint;
  project_role?: 'supervisor' | 'opponent';
}

export interface AddScaleToSetRequest {
  scale_id: bigint;
  weight: number;
  display_order?: number;
}

export interface UpdateScaleInSetRequest {
  weight: number;
  display_order?: number;
}

export interface BulkCloneScaleSetsRequest {
  yearId: bigint;
  scaleSetsData: Array<{
    name: string;
    project_role: 'supervisor' | 'opponent';
    scales: Array<{
      scale_id: bigint;
      weight: number;
      display_order?: number;
    }>;
  }>;
}

/**
 * Get all scale sets with relations (authenticated users)
 */
export async function getAllScaleSets(): Promise<ScaleSet[]> {
  return apiRequest<ScaleSet[]>('/scale-sets');
}

/**
 * Get scale set by ID with all relations
 */
export async function getScaleSetById(id: bigint): Promise<ScaleSet> {
  return apiRequest<ScaleSet>(`/scale-sets/${id}`);
}

/**
 * Create new scale set (admin only)
 */
export async function createScaleSet(data: CreateScaleSetRequest): Promise<ScaleSet> {
  return apiRequest<ScaleSet>('/scale-sets', {
    method: 'POST',
    body: data,
  });
}

/**
 * Update scale set (admin only)
 */
export async function updateScaleSet(
  id: bigint,
  data: UpdateScaleSetRequest
): Promise<ScaleSet> {
  return apiRequest<ScaleSet>(`/scale-sets/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Delete scale set (admin only)
 */
export async function deleteScaleSet(id: bigint): Promise<void> {
  return apiRequest<void>(`/scale-sets/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Add a scale to a scale set (admin only)
 */
export async function addScaleToSet(
  scaleSetId: bigint,
  data: AddScaleToSetRequest
): Promise<ScaleSetScale> {
  return apiRequest<ScaleSetScale>(`/scale-sets/${scaleSetId}/scales`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Remove a scale from a scale set (admin only)
 */
export async function removeScaleFromSet(
  scaleSetId: bigint,
  scaleId: bigint
): Promise<void> {
  return apiRequest<void>(`/scale-sets/${scaleSetId}/scales/${scaleId}`, {
    method: 'DELETE',
  });
}

/**
 * Update scale weight/order in a scale set (admin only)
 */
export async function updateScaleInSet(
  scaleSetId: bigint,
  scaleId: bigint,
  data: UpdateScaleInSetRequest
): Promise<ScaleSetScale> {
  return apiRequest<ScaleSetScale>(
    `/scale-sets/${scaleSetId}/scales/${scaleId}`,
    {
      method: 'PATCH',
      body: data,
    }
  );
}

/**
 * Bulk clone scale sets to a new year (admin only)
 * Creates multiple scale sets with their scales in a single transaction
 */
export async function bulkCloneScaleSets(
  data: BulkCloneScaleSetsRequest
): Promise<ScaleSet[]> {
  return apiRequest<ScaleSet[]>('/scale-sets/bulk-clone', {
    method: 'POST',
    body: data,
  });
}
