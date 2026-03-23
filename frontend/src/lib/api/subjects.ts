import { apiRequest } from './client';

// Subject interface matching database schema
export interface Subject {
  id: bigint;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    projects: number;
  };
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Get all active subjects (public endpoint for dropdowns)
 */
export async function getActiveSubjects(): Promise<Subject[]> {
  return apiRequest<Subject[]>('/subjects');
}

/**
 * Get all subjects including inactive (admin only)
 */
export async function getAllSubjects(): Promise<Subject[]> {
  return apiRequest<Subject[]>('/subjects/all/list');
}

/**
 * Get subject by ID
 */
export async function getSubjectById(id: bigint): Promise<Subject> {
  return apiRequest<Subject>(`/subjects/${id}`);
}

/**
 * Create new subject (admin only)
 */
export async function createSubject(data: CreateSubjectRequest): Promise<Subject> {
  return apiRequest<Subject>('/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update subject (admin only)
 */
export async function updateSubject(id: bigint, data: UpdateSubjectRequest): Promise<Subject> {
  return apiRequest<Subject>(`/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete subject (admin only)
 * Only works if no projects reference it
 */
export async function deleteSubject(id: bigint): Promise<void> {
  return apiRequest<void>(`/subjects/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Deactivate subject (admin only)
 * Safer alternative to deletion when projects reference the subject
 */
export async function deactivateSubject(id: bigint): Promise<Subject> {
  return apiRequest<Subject>(`/subjects/${id}/deactivate`, {
    method: 'POST',
  });
}

/**
 * Activate a previously deactivated subject (admin only)
 */
export async function activateSubject(id: bigint): Promise<Subject> {
  return apiRequest<Subject>(`/subjects/${id}/activate`, {
    method: 'POST',
  });
}
