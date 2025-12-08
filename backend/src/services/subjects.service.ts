import { prisma } from '../lib/prisma';

export interface CreateSubjectRequest {
  name_cs: string;
  name_en: string;
  description?: string;
}

export interface UpdateSubjectRequest {
  name_cs?: string;
  name_en?: string;
  description?: string;
  is_active?: boolean;
}

export class SubjectsService {
  /**
   * Get all active subjects for dropdown selection
   */
  static async getActiveSubjects() {
    return prisma.subjects.findMany({
      where: { is_active: true },
      orderBy: { name_cs: 'asc' },
      select: {
        id: true,
        name_cs: true,
        name_en: true,
        description: true,
      },
    });
  }

  /**
   * Get all subjects (including inactive) - admin only
   */
  static async getAllSubjects() {
    return prisma.subjects.findMany({
      orderBy: { name_cs: 'asc' },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  /**
   * Get single subject by ID
   */
  static async getSubjectById(id: bigint) {
    return prisma.subjects.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  /**
   * Create new subject - admin only
   */
  static async createSubject(data: CreateSubjectRequest) {
    return prisma.subjects.create({
      data: {
        name_cs: data.name_cs,
        name_en: data.name_en,
        description: data.description,
      },
    });
  }

  /**
   * Update subject - admin only
   */
  static async updateSubject(id: bigint, data: UpdateSubjectRequest) {
    return prisma.subjects.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
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

    return prisma.subjects.delete({
      where: { id },
    });
  }

  /**
   * Deactivate subject instead of deleting - admin only
   * Safer option when projects reference the subject
   */
  static async deactivateSubject(id: bigint) {
    return prisma.subjects.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  }
}
