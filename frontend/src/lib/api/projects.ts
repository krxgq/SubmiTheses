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
}

// Alias for server-side usage (maintains compatibility)
export const projectsApiServer = projectsApi;
