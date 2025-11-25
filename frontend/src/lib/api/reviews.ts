import { apiRequest } from './client'

export const reviewsApi = {
  getByProjectId: (projectId: string): Promise<any[]> =>
    apiRequest(`/projects/${projectId}/reviews`),

  create: (projectId: string, data: any): Promise<any> =>
    apiRequest(`/projects/${projectId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (projectId: string, reviewId: string, data: any): Promise<any> =>
    apiRequest(`/projects/${projectId}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, reviewId: string): Promise<void> =>
    apiRequest(`/projects/${projectId}/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
}
