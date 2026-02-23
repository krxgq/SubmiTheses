import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import { NotificationService } from './notifications.service';

/**
 * GradingService handles all grading operations for projects
 * Implements blind grading (teachers only see their own grades)
 * and date-gated student visibility (after feedback_date)
 */
export class GradingService {
  /**
   * Get scale set for teacher's role (supervisor or opponent)
   * Determines which scale set to use based on teacher's assignment
   * Also returns grading status (canSubmit, projectStatus, feedbackDate)
   */
  static async getScaleSetForTeacher(projectId: bigint, teacherId: string) {
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      select: {
        supervisor_id: true,
        opponent_id: true,
        year_id: true,
        status: true,
        years: {
          select: { feedback_date: true },
        },
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

    // Determine if grading is currently allowed
    const now = new Date();
    const feedbackDate = project.years?.feedback_date;
    const isBeforeDeadline = !feedbackDate || now <= feedbackDate;
    const isProjectLocked = project.status === 'locked';
    const canSubmit = isProjectLocked && isBeforeDeadline;

    return {
      ...scaleSet,
      gradingStatus: {
        canSubmit,
        projectStatus: project.status,
        feedbackDate: feedbackDate?.toISOString() || null,
        isBeforeDeadline,
      },
    };
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
   * Check if teacher can submit grades
   * Conditions: project must be locked AND current date < feedback_date
   */
  static async canTeacherSubmitGrades(projectId: bigint): Promise<{ canSubmit: boolean; reason?: string }> {
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      include: {
        years: {
          select: { feedback_date: true },
        },
      },
    });

    if (!project) {
      return { canSubmit: false, reason: 'Project not found' };
    }

    // Project must be locked for grading
    if (project.status !== 'locked') {
      return { canSubmit: false, reason: 'Project must be locked before grading' };
    }

    // Check if before feedback deadline
    if (project.years?.feedback_date) {
      const now = new Date();
      if (now > project.years.feedback_date) {
        return { canSubmit: false, reason: 'Feedback deadline has passed' };
      }
    }

    return { canSubmit: true };
  }

  /**
   * Submit/update grades for multiple scales at once
   * Uses upsert logic: updates existing grades or creates new ones
   * Validates: project must be locked AND before feedback_date
   */
  static async submitGrades(
    projectId: bigint,
    teacherId: string,
    yearId: bigint,
    grades: Array<{ scale_id: bigint; value: number }>
  ) {
    // Check if grading is allowed
    const { canSubmit, reason } = await this.canTeacherSubmitGrades(projectId);
    if (!canSubmit) {
      throw new Error(reason);
    }

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

    // Notify the other teacher (opponent if supervisor submitted, or vice versa)
    // Also check if student can see grades (feedback_date passed)
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      select: {
        title: true,
        student_id: true,
        supervisor_id: true,
        opponent_id: true,
        years: {
          select: {
            feedback_date: true,
          },
        },
      },
    });

    if (project) {
      let otherTeacherId: string | null = null;
      let role: string = '';

      if (project.supervisor_id === teacherId && project.opponent_id) {
        otherTeacherId = project.opponent_id;
        role = 'Supervisor';
      } else if (project.opponent_id === teacherId && project.supervisor_id) {
        otherTeacherId = project.supervisor_id;
        role = 'Opponent';
      }

      if (otherTeacherId) {
        await NotificationService.createNotification({
          userId: otherTeacherId,
          type: 'grades_submitted',
          title: 'Grades submitted',
          message: `Grades have been submitted for "${project.title}"`,
          metadata: { project_id: Number(projectId), reviewer_id: teacherId, project_title: project.title, role, projectTitle: project.title },
        });
      }

      // Check if student can see grades (feedback_date passed)
      const now = new Date();
      const feedbackDate = project.years?.feedback_date;
      const feedbackPassed = feedbackDate && now > feedbackDate;

      // Notify student if grades are visible now
      if (feedbackPassed && project.student_id) {
        await NotificationService.createNotification({
          userId: project.student_id,
          type: 'grade_published',
          title: 'Grades available',
          message: `Grades are now available for "${project.title}"`,
          metadata: { project_id: Number(projectId), reviewer_id: teacherId, project_title: project.title, projectTitle: project.title },
        });
      }
    }

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
