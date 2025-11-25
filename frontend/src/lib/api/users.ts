import { apiRequest } from './client'
import type {
  User,
  UserWithYear,
  UserRole,
  UpdateUserRequest,
  UpdateUserRoleRequest,
} from '@sumbi/shared-types'

// Re-export types for convenience
export type { User, UserWithYear, UserRole }

export const usersApi = {

  /**
   * Get all users with their year information (admin/teacher only)
   * GET /api/users
   */
  async getAll(): Promise<UserWithYear[]> {
    return apiRequest<UserWithYear[]>('/users');
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getById(id: string): Promise<UserWithYear> {
    return apiRequest<UserWithYear>(`/users/${id}`);
  },

  /**
   * Get users by role
   * GET /api/users/by-role?role=teacher
   */
  async getByRole(role: UserRole): Promise<User[]> {
    return apiRequest<User[]>(`/users/by-role?role=${role}`);
  },

  /**
   * Get all teachers (users with teacher or admin role)
   * GET /api/users/teachers
   * Useful for supervisor/opponent dropdowns
   */
  async getTeachers(): Promise<User[]> {
    return apiRequest<User[]>('/users/teachers');
  },

  /**
   * Get all students
   */
  async getStudents(): Promise<User[]> {
    return this.getByRole('student');
  },

  /**
   * Update user profile (name, year, email)
   * PUT /api/users/:id
   */
  async updateProfile(
    userId: string,
    updates: { full_name?: string; year_id?: number | null; email?: string }
  ): Promise<UserWithYear> {
    return apiRequest<UserWithYear>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Update user role (admin only)
   * PATCH /api/users/:id/role
   */
  async updateRole(userId: string, role: UserRole): Promise<UserWithYear> {
    return apiRequest<UserWithYear>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * Delete user (admin only)
   * DELETE /api/users/:id
   */
  async delete(userId: string): Promise<void> {
    return apiRequest<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
}
