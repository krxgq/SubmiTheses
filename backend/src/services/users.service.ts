import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import type { UserWithYear, UserRole, UpdateUserRequest } from '@sumbi/shared-types';
import type { Prisma } from '@prisma/client';

/**
 * User Service - handles operations on public.users table
 * Note: Prisma model is named 'public_users' (mapped to 'users' table in DB)
 * Uses shared types from @sumbi/shared-types package
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

    const users = await prisma.public_users.findMany({
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
  static async getUserById(id: string): Promise<Prisma.public_usersGetPayload<{ include: { years: true } }> | null> {
    const cacheKey = `user:${id}`;

    const cached = await cache.get<Prisma.public_usersGetPayload<{ include: { years: true } }>>(cacheKey);
    if (cached) return cached;

    const user = await prisma.public_users.findUnique({
      where: { id: String(id) },
      include: {
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

    const users = await prisma.public_users.findMany({
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

    const teachers = await prisma.public_users.findMany({
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
   * Update user profile (name, year, etc.)
   */
  static async updateUser(id: string, data: UpdateUserRequest) {
    const existingUser = await prisma.public_users.findUnique({
      where: { id: String(id) },
    });

    if (!existingUser) {
      return null;
    }

    const user = await prisma.public_users.update({
      where: { id: String(id) },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
        year_id: data.year_id,
        email: data.email,
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
    const existingUser = await prisma.public_users.findUnique({
      where: { id: String(id) },
      select: { role: true },
    });

    const user = await prisma.public_users.update({
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
   */
  static async deleteUser(id: string) {
    try {
      const existingUser = await prisma.public_users.findUnique({
        where: { id: String(id) },
        select: { role: true },
      });

      const deleted = await prisma.public_users.delete({
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