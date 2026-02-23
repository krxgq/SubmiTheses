import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import { ActivityLogService } from './activity-logs.service';
import { NotificationService } from './notifications.service';

/**
 * Student info returned with signups
 */
export interface SignupStudent {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  class: string | null;
  signed_up_at: Date;
}

/**
 * Signup validation result
 */
interface SignupValidation {
  valid: boolean;
  error?: string;
}

/**
 * Service for managing student signups/interest in projects
 * Students can express interest in available topics before assignment
 */
export class ProjectSignupService {

  /**
   * Validate if a student can sign up for a project
   */
  private static async validateSignup(projectId: bigint, studentId: string): Promise<SignupValidation> {
    // Get project to check availability
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      select: { id: true, student_id: true, status: true },
    });

    if (!project) {
      return { valid: false, error: 'Project not found' };
    }

    // Project must not have a student assigned
    if (project.student_id) {
      return { valid: false, error: 'Project already has a student assigned' };
    }

    // Project must be in draft status (available for signups)
    if (project.status !== 'draft') {
      return { valid: false, error: 'Project is not available for signups' };
    }

    // Check if student is already assigned to any project
    const existingAssignment = await prisma.projects.findFirst({
      where: { student_id: studentId },
      select: { id: true, title: true },
    });

    if (existingAssignment) {
      return { valid: false, error: 'You are already assigned to a project' };
    }

    // Check if student already signed up for this project
    const existingSignup = await prisma.project_signups.findUnique({
      where: {
        project_id_student_id: {
          project_id: Number(projectId),
          student_id: studentId,
        },
      },
    });

    if (existingSignup) {
      return { valid: false, error: 'You have already signed up for this project' };
    }

    return { valid: true };
  }

  /**
   * Student signs up to express interest in a project
   */
  static async signupForProject(projectId: bigint, studentId: string): Promise<{ success: boolean; error?: string }> {
    // Validate signup
    const validation = await this.validateSignup(projectId, studentId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create signup record
    await prisma.project_signups.create({
      data: {
        project_id: Number(projectId),
        student_id: studentId,
      },
    });

    // Invalidate cache
    await cache.delete(`signups:project:${projectId}`);

    // Log activity
    await ActivityLogService.logActivity(
      projectId,
      studentId,
      'student_signup',
      'Student expressed interest in project'
    );

    // Notify supervisor about the signup
    const project = await prisma.projects.findUnique({
      where: { id: Number(projectId) },
      select: {
        title: true,
        supervisor_id: true,
        users_projects_student_idTousers: {
          select: { first_name: true, last_name: true, email: true },
        },
      },
    });

    if (project?.supervisor_id) {
      const student = await prisma.users.findUnique({
        where: { id: studentId },
        select: { first_name: true, last_name: true, email: true },
      });

      const studentName = student?.first_name && student?.last_name
        ? `${student.first_name} ${student.last_name}`
        : student?.email || 'A student';

      await NotificationService.createNotification({
        userId: project.supervisor_id,
        type: 'signup_received',
        title: 'New project signup',
        message: `${studentName} expressed interest in "${project.title}"`,
        metadata: { project_id: Number(projectId), student_id: studentId, projectTitle: project.title, studentName },
      });
    }

    return { success: true };
  }

  /**
   * Student cancels their signup for a project
   */
  static async cancelSignup(projectId: bigint, studentId: string): Promise<{ success: boolean; error?: string }> {
    // Check if signup exists
    const existingSignup = await prisma.project_signups.findUnique({
      where: {
        project_id_student_id: {
          project_id: Number(projectId),
          student_id: studentId,
        },
      },
    });

    if (!existingSignup) {
      return { success: false, error: 'You have not signed up for this project' };
    }

    // Delete signup
    await prisma.project_signups.delete({
      where: {
        project_id_student_id: {
          project_id: Number(projectId),
          student_id: studentId,
        },
      },
    });

    // Invalidate cache
    await cache.delete(`signups:project:${projectId}`);

    // Log activity
    await ActivityLogService.logActivity(
      projectId,
      studentId,
      'student_unsignup',
      'Student withdrew interest from project'
    );

    return { success: true };
  }

  /**
   * Get all students who signed up for a project (for teachers/admins)
   */
  static async getProjectSignups(projectId: bigint): Promise<SignupStudent[]> {
    const cacheKey = `signups:project:${projectId}`;

    // Try cache first
    const cached = await cache.get<SignupStudent[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query signups with student details
    const signups = await prisma.project_signups.findMany({
      where: { project_id: Number(projectId) },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          },
        },
      },
      orderBy: { created_at: 'asc' }, // First come, first served order
    });

    // Transform to cleaner format
    const students: SignupStudent[] = signups.map(signup => ({
      id: signup.users.id,
      email: signup.users.email,
      first_name: signup.users.first_name,
      last_name: signup.users.last_name,
      class: signup.users.class,
      signed_up_at: signup.created_at,
    }));

    // Cache for 30 seconds
    await cache.set(cacheKey, students, 30);

    return students;
  }

  /**
   * Check if a student has signed up for a project
   */
  static async hasStudentSignedUp(projectId: bigint, studentId: string): Promise<boolean> {
    const signup = await prisma.project_signups.findUnique({
      where: {
        project_id_student_id: {
          project_id: Number(projectId),
          student_id: studentId,
        },
      },
    });

    return !!signup;
  }

  /**
   * Check if a student is assigned to any project
   */
  static async studentHasProject(studentId: string): Promise<boolean> {
    const project = await prisma.projects.findFirst({
      where: { student_id: studentId },
      select: { id: true },
    });

    return !!project;
  }

  /**
   * Remove all signups for a project when a student is assigned
   * Called by ProjectService.assignStudentToProject
   */
  static async cleanupOnAssignment(projectId: bigint): Promise<number> {
    // Delete all signups for this project
    const result = await prisma.project_signups.deleteMany({
      where: { project_id: Number(projectId) },
    });

    // Invalidate cache
    await cache.delete(`signups:project:${projectId}`);

    return result.count;
  }
}
