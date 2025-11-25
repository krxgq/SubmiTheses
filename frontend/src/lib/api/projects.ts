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
  }
}
