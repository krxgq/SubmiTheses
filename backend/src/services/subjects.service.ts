import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import type { CreateSubjectRequest, UpdateSubjectRequest } from '@sumbi/shared-types';

export class SubjectsService {
  /**
   * Get all active subjects for dropdown selection
   * Cached heavily as this is used in UI dropdowns
   */
  static async getActiveSubjects() {
    const cacheKey = 'subjects:active';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const subjects = await prisma.subjects.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    // Cache for 10 minutes (subjects rarely change)
    await cache.set(cacheKey, subjects, 600);

    return subjects;
  }

  /**
   * Get all subjects (including inactive) - admin only
   */
  static async getAllSubjects() {
    const cacheKey = 'subjects:all';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const subjects = await prisma.subjects.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    // Cache for 10 minutes
    await cache.set(cacheKey, subjects, 600);

    return subjects;
  }

  /**
   * Get single subject by ID
   */
  static async getSubjectById(id: bigint) {
    const cacheKey = `subject:${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const subject = await prisma.subjects.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    // Cache for 10 minutes
    if (subject) {
      await cache.set(cacheKey, subject, 600);
    }

    return subject;
  }

  /**
   * Create new subject - admin only
   */
  static async createSubject(data: CreateSubjectRequest) {
    const subject = await prisma.subjects.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    // Invalidate subjects list caches
    await cache.delete('subjects:all');
    await cache.delete('subjects:active');

    return subject;
  }

  /**
   * Update subject - admin only
   */
  static async updateSubject(id: bigint, data: UpdateSubjectRequest) {
    const subject = await prisma.subjects.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    // Invalidate all subject-related caches
    await cache.delete(`subject:${id}`);
    await cache.delete('subjects:all');
    await cache.delete('subjects:active');

    return subject;
  }

  /**
   * Delete subject - admin only
   * Only allowed if no projects reference it
   */
  static async deleteSubject(id: bigint) {
    // Check if subject is used by any projects
    const projectCount = await prisma.projects.count({
      where: { subject_id: id },
    });

    if (projectCount > 0) {
      throw new Error(
        `Cannot delete subject: ${projectCount} project(s) are using this subject`
      );
    }

    const subject = await prisma.subjects.delete({
      where: { id },
    });

    // Invalidate all subject-related caches
    await cache.delete(`subject:${id}`);
    await cache.delete('subjects:all');
    await cache.delete('subjects:active');

    return subject;
  }

  /**
   * Deactivate subject instead of deleting - admin only
   * Safer option when projects reference the subject
   */
  static async deactivateSubject(id: bigint) {
    const subject = await prisma.subjects.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    // Invalidate all subject-related caches
    await cache.delete(`subject:${id}`);
    await cache.delete('subjects:all');
    await cache.delete('subjects:active');

    return subject;
  }
}
