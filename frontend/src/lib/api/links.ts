import { apiRequest } from './client'

export const linksApi = {
  getByProjectId: (projectId: string): Promise<any[]> =>
    apiRequest(`/projects/${projectId}/links`),

  create: (projectId: string, data: { url: string; description?: string }): Promise<any> =>
    apiRequest(`/projects/${projectId}/links`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (projectId: string, linkId: string, data: { url: string; description?: string }): Promise<any> =>
    apiRequest(`/projects/${projectId}/links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, linkId: string): Promise<void> =>
    apiRequest(`/projects/${projectId}/links/${linkId}`, {
      method: 'DELETE',
    }),
}
