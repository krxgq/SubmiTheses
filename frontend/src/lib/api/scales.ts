import { apiRequest } from './client'

export const scalesApi = {
  getAll: (): Promise<any[]> =>
    apiRequest('/scales'),

  getById: (id: string): Promise<any> =>
    apiRequest(`/scales/${id}`),

  create: (data: any): Promise<any> =>
    apiRequest('/scales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any): Promise<any> =>
    apiRequest(`/scales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/scales/${id}`, {
      method: 'DELETE',
    }),
}
