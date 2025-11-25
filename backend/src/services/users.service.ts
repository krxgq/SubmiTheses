import { prisma } from '../lib/prisma';
import type { UserWithYear, UserRole, UpdateUserRequest } from '@sumbi/shared-types';

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
    return await prisma.public_users.findMany({
      include: {
        years: true, // Include related year data
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get user by ID with year information
   */
  static async getUserById(id: string) {
    return await prisma.public_users.findUnique({
      where: { id: String(id) },
      include: {
        years: true,
      },
    });
  }

  /**
   * Get users filtered by role
   */
  static async getUsersByRole(role: 'admin' | 'teacher' | 'student') {
    return await prisma.public_users.findMany({
      where: { role },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get all teachers (users with teacher or admin role)
   */
  static async getTeachers() {
    return await prisma.public_users.findMany({
      where: {
        role: {
          in: ['teacher', 'admin'],
        },
      },
      orderBy: {
        full_name: 'asc',
      },
    });
  }

  /**
   * Update user profile (name, year, etc.)
   */
  static async updateUser(id: string, data: UpdateUserRequest): Promise<UserWithYear | null> {
    const existingUser = await prisma.public_users.findUnique({
      where: { id: String(id) },
    });

    if (!existingUser) {
      return null;
    }

    return await prisma.public_users.update({
      where: { id: String(id) },
      data: {
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        year_id: data.year_id,
        email: data.email,
      },
      include: {
        years: true,
      },
    });
  }

  /**
   * Update user role (admin only - handled by middleware)
   */
  static async updateUserRole(id: string, role: 'admin' | 'teacher' | 'student') {
    return await prisma.public_users.update({
      where: { id: String(id) },
      data: { role },
      include: {
        years: true,
      },
    });
  }

  /**
   * Delete user (admin only - handled by middleware)
   */
  static async deleteUser(id: string) {
    try {
      const deleted = await prisma.public_users.delete({
        where: { id: String(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}