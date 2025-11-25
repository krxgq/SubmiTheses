import { apiRequest } from './client'

export const gradesApi = {
  getAll: (): Promise<any[]> =>
    apiRequest('/grades'),

  getById: (id: string): Promise<any> =>
    apiRequest(`/grades/${id}`),

  getByProjectId: (projectId: string): Promise<any[]> =>
    apiRequest(`/projects/${projectId}/grades`),

  create: (data: any): Promise<any> =>
    apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any): Promise<any> =>
    apiRequest(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/grades/${id}`, {
      method: 'DELETE',
    }),
}
