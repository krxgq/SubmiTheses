import { apiRequest } from "./client"
import type { ProjectWithRelations } from "@sumbi/shared-types"

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
    return apiRequest<ProjectWithRelations>(`/projects/${id}/students`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
  },

  /**
   * Remove a student from a project
   * @param id - Project ID
   */
  removeStudent: async (id: string | number): Promise<ProjectWithRelations> => {
    return apiRequest<ProjectWithRelations>(`/projects/${id}/students`, {
      method: 'DELETE',
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
}

// Alias for server-side usage (maintains compatibility)
export const projectsApiServer = projectsApi;
