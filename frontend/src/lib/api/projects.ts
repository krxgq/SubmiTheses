import { apiRequest } from "./client"
import { API_BASE_URL } from "./client"
import type { ProjectWithRelations, RecentActivityResponse } from "@sumbi/shared-types"

/**
 * Projects API
 * Works in both Server and Client Components
 * Session token is retrieved from cookies
 */
export const projectsApi = {
  /**
   * Fetch all projects (list view)
   */
  getAllProjects: async (): Promise<ProjectWithRelations[]> => {
    return apiRequest<ProjectWithRelations[]>('/projects');
  },

  /**
   * Fetch a single project by ID (detail view)
   * @param id - Project ID
   */
  getProjectById: async (id: string | number): Promise<ProjectWithRelations> => {
    return apiRequest<ProjectWithRelations>(`/projects/${id}`);
  },

  /**
   * Create a new project
   * @param payload - Project data
   */
  createProject: async (payload: any): Promise<ProjectWithRelations> => {
    return apiRequest<ProjectWithRelations>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update a project
   * @param id - Project ID
   * @param payload - Updated project data
   */
  updateProject: async (id: string | number, payload: any): Promise<ProjectWithRelations> => {
    return apiRequest<ProjectWithRelations>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a project
   * @param id - Project ID
   */
  deleteProject: async (id: string | number): Promise<void> => {
    return apiRequest<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Assign a student to a project
   * @param id - Project ID
   * @param studentId - Student user ID
   */
  assignStudent: async (id: string | number, studentId: string): Promise<ProjectWithRelations> => {
    return apiRequest<ProjectWithRelations>(`/projects/${id}/student`, {
      method: 'PUT',
      body: JSON.stringify({ studentId }),
    });
  },

  /**
   * Remove a student from a project (by passing null studentId)
   * @param id - Project ID
   */
  removeStudent: async (id: string | number): Promise<ProjectWithRelations> => {
    return apiRequest<ProjectWithRelations>(`/projects/${id}/student`, {
      method: 'PUT',
      body: JSON.stringify({ studentId: null }),
    });
  },

  /**
   * Export project as PDF
   * @param id - Project ID
   */
  exportPDF: async (id: string | number): Promise<Blob> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}/projects/${id}/export-pdf`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to export PDF');
    }

    return response.blob();
  },

  /**
   * Get recent activities for a project
   * @param id - Project ID
   * @param limit - Number of activities to fetch (default: 5)
   */
  getProjectActivities: async (id: string | number, limit: number = 5): Promise<RecentActivityResponse> => {
    return apiRequest<RecentActivityResponse>(`/projects/${id}/activities?limit=${limit}`);
  },

  // Lock/unlock methods
  /**
   * Lock a project (manual lock by supervisor or admin)
   * Prevents further edits except by admins
   */
  lockProject: async (id: string | number): Promise<ProjectWithRelations> => {
    return apiRequest<any>(`/projects/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'locked' }),
    }).then(res => res.project);
  },

  /**
   * Unlock a project (admin or supervisor)
   * Allows editing again - reverts to draft
   */
  unlockProject: async (id: string | number): Promise<ProjectWithRelations> => {
    return apiRequest<any>(`/projects/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'draft' }),
    }).then(res => res.project);
  },

  /**
   * Publish a project (admin only)
   * Changes status from locked to public
   */
  publishProject: async (id: string | number): Promise<ProjectWithRelations> => {
    return apiRequest<any>(`/projects/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'public' }),
    }).then(res => res.project);
  },

  /**
   * Bulk publish multiple locked projects at once (admin only)
   * @param projectIds - Array of project IDs to publish
   */
  bulkPublish: async (projectIds: (string | number)[]): Promise<{ published: number; failed: number; results: { id: number; status: string }[] }> => {
    return apiRequest<{ published: number; failed: number; results: { id: number; status: string }[] }>('/projects/bulk-publish', {
      method: 'PUT',
      body: JSON.stringify({ projectIds }),
    });
  },

  // Grading methods
  /**
   * Get scale set for teacher's role (supervisor or opponent)
   * Returns the appropriate scale set based on teacher's assignment
   */
  getScaleSetForGrading: async (id: string | number): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/grading/scale-set`);
  },

  /**
   * Get teacher's own grades for a project (blind grading)
   * Only returns grades submitted by the requesting teacher
   */
  getMyGrades: async (id: string | number): Promise<any[]> => {
    return apiRequest<any[]>(`/projects/${id}/grading/my-grades`);
  },

  /**
   * Submit/update grades for a project
   * @param id - Project ID
   * @param yearId - Year ID
   * @param grades - Array of {scale_id, value} objects
   */
  submitGrades: async (
    id: string | number,
    yearId: string | number,
    grades: Array<{ scale_id: string | number; value: number }>
  ): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/grading/submit`, {
      method: 'POST',
      body: JSON.stringify({ year_id: yearId, grades }),
    });
  },

  /**
   * Get all grades for a project (admin or student after feedback_date)
   * Returns grades grouped by reviewer
   */
  getAllGrades: async (id: string | number): Promise<any> => {
    return apiRequest<any>(`/projects/${id}/grading/all`);
  },

  // Student signup (interest expression) methods
  /**
   * Student signs up (expresses interest) for a project
   * @param id - Project ID
   */
  signupForProject: async (id: string | number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/projects/${id}/signup`, {
      method: 'POST',
    });
  },

  /**
   * Student cancels their signup for a project
   * @param id - Project ID
   */
  cancelSignup: async (id: string | number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/projects/${id}/signup`, {
      method: 'DELETE',
    });
  },

  /**
   * Check if current user has signed up for a project
   * Also returns whether student is assigned to any project
   * @param id - Project ID
   */
  getSignupStatus: async (id: string | number): Promise<{ signedUp: boolean; hasProject?: boolean }> => {
    return apiRequest<{ signedUp: boolean; hasProject?: boolean }>(`/projects/${id}/signup/status`);
  },

  /**
   * Get all students who signed up for a project (teachers/admins only)
   * @param id - Project ID
   */
  getProjectSignups: async (id: string | number): Promise<{
    signups: Array<{
      id: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      class: string | null;
      signed_up_at: string;
    }>;
    count: number;
  }> => {
    return apiRequest(`/projects/${id}/signups`);
  },
}

// Alias for server-side usage (maintains compatibility)
export const projectsApiServer = projectsApi;

/**
 * Public projects API — no auth token needed
 * Uses plain fetch (no cookie forwarding) for guest access
 */
export const publicProjectsApi = {
  /** Fetch all public projects (status: 'public') */
  getAll: async (): Promise<ProjectWithRelations[]> => {
    const res = await fetch(`${API_BASE_URL}/projects/public`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch public projects');
    return res.json();
  },

  /** Fetch a single public project by ID */
  getById: async (id: string | number): Promise<ProjectWithRelations> => {
    const res = await fetch(`${API_BASE_URL}/projects/public/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Public project not found');
    return res.json();
  },

  /** Fetch attachments for a public project */
  getAttachments: async (id: string | number): Promise<{ id: string; filename: string; description: string | null; uploaded_at: string }[]> => {
    const res = await fetch(`${API_BASE_URL}/projects/public/${id}/attachments`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch attachments');
    return res.json();
  },

  /** Get pre-signed download URL for a public project attachment */
  getDownloadUrl: async (projectId: string | number, attachmentId: string | number): Promise<{ downloadUrl: string; filename: string }> => {
    const res = await fetch(`${API_BASE_URL}/projects/public/${projectId}/attachments/${attachmentId}/download-url`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to get download URL');
    return res.json();
  },
};
