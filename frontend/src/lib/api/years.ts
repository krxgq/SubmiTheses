import { apiRequest } from './client'

export const yearsApi = {
  getAll: (): Promise<any[]> =>
    apiRequest('/years'),

  getById: (id: string): Promise<any> =>
    apiRequest(`/years/${id}`),

  create: (data: any): Promise<any> =>
    apiRequest('/years', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any): Promise<any> =>
    apiRequest(`/years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/years/${id}`, {
      method: 'DELETE',
    }),
}
