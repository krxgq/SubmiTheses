import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';

/**
 * GradingService handles all grading operations for projects
 * Implements blind grading (teachers only see their own grades)
 * and date-gated student visibility (after feedback_date)
 */
export class GradingService {
  /**
   * Get scale set for teacher's role (supervisor or opponent)
   * Determines which scale set to use based on teacher's assignment
   */
  static async getScaleSetForTeacher(projectId: bigint, teacherId: string) {
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      select: {
        supervisor_id: true,
        opponent_id: true,
        year_id: true,
      },
    });

    if (!project?.year_id) {
      throw new Error('Project has no associated year');
    }

    // Determine teacher's role on this project
    const role = project.supervisor_id === teacherId
      ? 'supervisor'
      : project.opponent_id === teacherId
      ? 'opponent'
      : null;

    if (!role) {
      throw new Error('Teacher is not assigned to this project');
    }

    // Fetch scale set for this role and year
    const scaleSet = await prisma.scale_sets.findFirst({
      where: {
        year_id: project.year_id,
        project_role: role,
      },
      include: {
        scale_set_scales: {
          include: {
            scales: true,
          },
          orderBy: { display_order: 'asc' },
        },
      },
    });

    if (!scaleSet) {
      throw new Error(`No scale set found for ${role} in this year`);
    }

    return scaleSet;
  }

  /**
   * Get teacher's own grades for a project (blind grading)
   * Only returns grades submitted by this specific teacher
   */
  static async getTeacherGrades(projectId: bigint, teacherId: string) {
    const cacheKey = `grades:project:${projectId}:teacher:${teacherId}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const grades = await prisma.grades.findMany({
      where: {
        project_id: Number(projectId),
        reviewer_id: teacherId,
      },
      include: {
        scales: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Cache for 5 minutes (grades may change during grading session)
    await cache.set(cacheKey, grades, 300);

    return grades;
  }

  /**
   * Submit/update grades for multiple scales at once
   * Uses upsert logic: updates existing grades or creates new ones
   */
  static async submitGrades(
    projectId: bigint,
    teacherId: string,
    yearId: bigint,
    grades: Array<{ scale_id: bigint; value: number }>
  ) {
    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const updatedGrades = [];

      for (const { scale_id, value } of grades) {
        // Check if grade already exists (update) or create new
        const existingGrade = await tx.grades.findFirst({
          where: {
            project_id: Number(projectId),
            reviewer_id: teacherId,
            scale_id: Number(scale_id),
          },
        });

        if (existingGrade) {
          // Update existing grade
          const updated = await tx.grades.update({
            where: { id: existingGrade.id },
            data: { value: Number(value) },
            include: { scales: true },
          });
          updatedGrades.push(updated);
        } else {
          // Create new grade
          const created = await tx.grades.create({
            data: {
              project_id: Number(projectId),
              reviewer_id: teacherId,
              scale_id: Number(scale_id),
              year_id: Number(yearId),
              value: Number(value),
            },
            include: { scales: true },
          });
          updatedGrades.push(created);
        }
      }

      return updatedGrades;
    });

    // Invalidate caches
    await cache.delete(`grades:project:${projectId}:teacher:${teacherId}`);
    await cache.delete(`grades:project:${projectId}:all`);

    return result;
  }

  /**
   * Calculate weighted average grade from scale grades
   * Formula: sum((value/maxVal * 100) * weight) / sum(weights)
   */
  static calculateWeightedAverage(
    grades: Array<{ value: bigint | number; scales: { maxVal: bigint | number }; weight: number }>
  ): number {
    if (grades.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const grade of grades) {
      const value = Number(grade.value);
      const maxVal = Number(grade.scales.maxVal);
      const weight = grade.weight;

      const normalizedScore = (value / maxVal) * 100;
      totalWeightedScore += normalizedScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }

  /**
   * Get all grades for a project grouped by reviewer
   * Used by admins (anytime) and students (after feedback_date)
   */
  static async getAllProjectGrades(projectId: bigint) {
    const cacheKey = `grades:project:${projectId}:all`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const grades = await prisma.grades.findMany({
      where: { project_id: Number(projectId) },
      include: {
        scales: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Group by reviewer
    const gradesByReviewer = grades.reduce((acc, grade) => {
      const reviewerId = grade.reviewer_id;
      if (!acc[reviewerId]) {
        acc[reviewerId] = {
          reviewer: grade.users,
          grades: [],
        };
      }
      acc[reviewerId].grades.push(grade);
      return acc;
    }, {} as Record<string, any>);

    // Cache for 5 minutes
    await cache.set(cacheKey, gradesByReviewer, 300);

    return gradesByReviewer;
  }

  /**
   * Check if student can view grades (after feedback_date)
   * Returns true if current date >= feedback_date
   */
  static async canStudentViewGrades(projectId: bigint): Promise<boolean> {
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      include: {
        years: {
          select: { feedback_date: true },
        },
      },
    });

    if (!project?.years?.feedback_date) {
      return false;
    }

    const now = new Date();
    return now >= project.years.feedback_date;
  }
}
