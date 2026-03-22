import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import type { UserWithYear, UserRole, UpdateUserRequest } from '@sumbi/shared-types';
import type { Prisma } from '@prisma/client';

/**
 * User Service - handles operations on users table
 */
export class UserService {
  /**
   * Get all users with their year information
   * Ordered by creation date (newest first)
   */
  static async getAllUsers() {
    const cacheKey = 'users:all';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const users = await prisma.users.findMany({
      include: {
        years: true, // Include related year data
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Cache for 5 minutes (user list doesn't change frequently)
    await cache.set(cacheKey, users, 300);

    return users;
  }

  /**
   * Get user by ID with year information
   */
  static async getUserById(id: string): Promise<Prisma.usersGetPayload<{ include: { years: true } }> | null> {
    const cacheKey = `user:${id}`;

    const cached = await cache.get<Prisma.usersGetPayload<{ include: { years: true } }>>(cacheKey);
    if (cached) return cached;

    const user = await prisma.users.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        role: true,
        year_id: true,
        created_at: true,
        updated_at: true,
        class: true,
        password_hash: true,
        email_verified: true,
        email_verified_at: true,
        password_reset_token: true,
        password_reset_expires: true,
        last_login: true,
        auth_provider: true,  // needed by frontend to show correct settings UI
        microsoft_id: true,   // needed to detect linked Microsoft account
        years: true,
      },
    });

    // Cache for 5 minutes
    if (user) {
      await cache.set(cacheKey, user, 300);
    }

    return user;
  }

  /**
   * Get users filtered by role
   */
  static async getUsersByRole(role: 'admin' | 'teacher' | 'student') {
    const cacheKey = `users:role:${role}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const users = await prisma.users.findMany({
      where: { role },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, users, 300);

    return users;
  }

  /**
   * Get all teachers (users with teacher or admin role)
   * Ordered by last name, then first name
   * Heavily cached as used in dropdown selectors throughout the app
   */
  static async getTeachers() {
    const cacheKey = 'users:teachers';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const teachers = await prisma.users.findMany({
      where: {
        role: {
          in: ['teacher', 'admin'],
        },
      },
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'asc' },
      ],
    });

    // Cache for 5 minutes (teacher list accessed frequently in dropdowns)
    await cache.set(cacheKey, teachers, 300);

    return teachers;
  }

  /**
   * Bulk assign year to multiple users (admin only)
   * Single atomic query + cache invalidation for all affected keys
   */
  static async bulkAssignYear(userIds: string[], yearId: bigint | null) {
    const result = await prisma.users.updateMany({
      where: { id: { in: userIds } },
      data: { year_id: yearId },
    });

    // Invalidate all user-related caches
    await cache.delete('users:all');
    await cache.delete('users:role:student');
    await cache.delete('users:role:teacher');
    await cache.delete('users:role:admin');
    await cache.delete('users:teachers');
    for (const id of userIds) {
      await cache.delete(`user:${id}`);
    }

    return { updated: result.count };
  }

  /**
   * Update user profile (name, year, etc.)
   */
  static async updateUser(id: string, data: UpdateUserRequest & { class?: string }) {
    const existingUser = await prisma.users.findUnique({
      where: { id: String(id) },
    });

    if (!existingUser) {
      return null;
    }

    const user = await prisma.users.update({
      where: { id: String(id) },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
        year_id: data.year_id,
        email: data.email,
        class: data.class,
      },
      include: {
        years: true,
      },
    });

    // Invalidate user-related caches
    await cache.delete(`user:${id}`);
    await cache.delete('users:all');
    await cache.delete(`users:role:${existingUser.role}`);
    // If teacher/admin, also invalidate teachers cache
    if (existingUser.role === 'teacher' || existingUser.role === 'admin') {
      await cache.delete('users:teachers');
    }

    return user;
  }

  /**
   * Update user role (admin only - handled by middleware)
   */
  static async updateUserRole(id: string, role: 'admin' | 'teacher' | 'student') {
    const existingUser = await prisma.users.findUnique({
      where: { id: String(id) },
      select: { role: true },
    });

    const user = await prisma.users.update({
      where: { id: String(id) },
      data: { role },
      include: {
        years: true,
      },
    });

    // Invalidate user-related caches (role change affects multiple caches)
    await cache.delete(`user:${id}`);
    await cache.delete('users:all');
    await cache.delete('users:teachers');
    // Invalidate both old and new role caches
    if (existingUser?.role) {
      await cache.delete(`users:role:${existingUser.role}`);
    }
    await cache.delete(`users:role:${role}`);

    return user;
  }

  /**
   * Delete user (admin only - handled by middleware)
   * Unassigns user from all projects before deletion
   */
  static async deleteUser(id: string) {
    try {
      const existingUser = await prisma.users.findUnique({
        where: { id: String(id) },
        select: { role: true },
      });

      // Unassign user from all projects before deletion
      await prisma.projects.updateMany({
        where: { supervisor_id: id },
        data: { supervisor_id: null },
      });

      await prisma.projects.updateMany({
        where: { opponent_id: id },
        data: { opponent_id: null },
      });

      await prisma.projects.updateMany({
        where: { student_id: id },
        data: { student_id: null },
      });

      // Delete the user (grades will cascade delete automatically)
      const deleted = await prisma.users.delete({
        where: { id: String(id) },
      });

      // Invalidate user-related caches
      await cache.delete(`user:${id}`);
      await cache.delete('users:all');
      if (existingUser?.role) {
        await cache.delete(`users:role:${existingUser.role}`);
        // If teacher/admin, also invalidate teachers cache
        if (existingUser.role === 'teacher' || existingUser.role === 'admin') {
          await cache.delete('users:teachers');
        }
      }

      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}