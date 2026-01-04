import { apiRequest } from './client';

// Scale interface matching database schema
// Note: maxVal is number in frontend, backend converts to bigint
export interface Scale {
  id: bigint;
  name: string;
  desc?: string;
  maxVal: number;
  created_at: string;
  _count?: {
    grades: number;
    scale_set_scales: number;
  };
}

// Request interfaces for creating/updating scales
export interface CreateScaleRequest {
  name: string;
  desc?: string;
  maxVal: number | string; // Accept both for flexibility
}

export interface UpdateScaleRequest {
  name?: string;
  desc?: string;
  maxVal?: number | string;
}

/**
 * Get all scales (authenticated users)
 */
export async function getAllScales(): Promise<Scale[]> {
  return apiRequest<Scale[]>('/scales');
}

/**
 * Get scale by ID
 */
export async function getScaleById(id: bigint): Promise<Scale> {
  return apiRequest<Scale>(`/scales/${id}`);
}

/**
 * Create new scale (admin only)
 */
export async function createScale(data: CreateScaleRequest): Promise<Scale> {
  return apiRequest<Scale>('/scales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update scale (admin only)
 */
export async function updateScale(id: bigint, data: UpdateScaleRequest): Promise<Scale> {
  return apiRequest<Scale>(`/scales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete scale (admin only)
 * May fail if scale is used in grades or scale sets
 */
export async function deleteScale(id: bigint): Promise<void> {
  return apiRequest<void>(`/scales/${id}`, {
    method: 'DELETE',
  });
}

// Legacy export for backwards compatibility
export const scalesApi = {
  getAll: getAllScales,
  getById: getScaleById,
  create: createScale,
  update: updateScale,
  delete: deleteScale,
};
