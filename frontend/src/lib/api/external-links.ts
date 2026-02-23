import { apiRequest } from './client';

// Interface matching the database model
export interface ExternalLink {
  id: string;
  project_id: string;
  url: string;
  title: string | null;
  description: string | null;
  added_at: string;
  updated_at: string;
}

// Request types for create/update operations
export interface CreateExternalLinkRequest {
  url: string;
  title?: string;
  description?: string;
}

export interface UpdateExternalLinkRequest {
  url?: string;
  title?: string;
  description?: string;
}

/**
 * Get all external links for a project
 */
export async function getExternalLinksByProjectId(projectId: string): Promise<ExternalLink[]> {
  return apiRequest<ExternalLink[]>(`/projects/${projectId}/links`);
}

/**
 * Create a new external link
 */
export async function createExternalLink(
  projectId: string,
  data: CreateExternalLinkRequest
): Promise<ExternalLink> {
  return apiRequest<ExternalLink>(`/projects/${projectId}/links`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing external link
 */
export async function updateExternalLink(
  projectId: string,
  linkId: string,
  data: UpdateExternalLinkRequest
): Promise<ExternalLink> {
  return apiRequest<ExternalLink>(`/projects/${projectId}/links/${linkId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an external link
 */
export async function deleteExternalLink(projectId: string, linkId: string): Promise<void> {
  return apiRequest<void>(`/projects/${projectId}/links/${linkId}`, {
    method: 'DELETE',
  });
}

// Grouped export for consistent API access pattern
export const externalLinksApi = {
  getByProjectId: getExternalLinksByProjectId,
  create: createExternalLink,
  update: updateExternalLink,
  delete: deleteExternalLink,
};
