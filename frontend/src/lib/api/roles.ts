import { apiRequest } from './client'

export const rolesApi = {
  getAll: (): Promise<any[]> =>
    apiRequest('/roles'),

  getByUserId: (userId: string): Promise<any[]> =>
    apiRequest(`/users/${userId}/roles`),

  assignRole: (userId: string, roleId: number): Promise<void> =>
    apiRequest(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    }),

  removeRole: (userId: string, roleId: number): Promise<void> =>
    apiRequest(`/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    }),

  updateUserRoles: (userId: string, roleIds: number[]): Promise<any[]> =>
    apiRequest(`/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    }),
}
