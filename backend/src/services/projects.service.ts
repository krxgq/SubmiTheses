import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import { CreateProjectSchema, UpdateProjectSchema } from '../types';
import { ActivityLogService } from './activity-logs.service';
import type {
  Project,
  ProjectWithRelations,
  CreateProjectRequest,
  UpdateProjectRequest,
  User
} from '@sumbi/shared-types';

/**
 * Transforms Prisma's verbose relation names to clean API property names
 * Maps: users_projects_student_idTousers -> student
 */
function transformPrismaProject(prismaProject: any): ProjectWithRelations {
  const {
    users_projects_student_idTousers,
    users_projects_supervisor_idTousers,
    users_projects_opponent_idTousers,
    years,
    ...projectData
  } = prismaProject;

  return {
    ...projectData,
    student: users_projects_student_idTousers,
    supervisor: users_projects_supervisor_idTousers,
    opponent: users_projects_opponent_idTousers,
    year: years,
  };
}

export class ProjectService {
  /**
   * Create a new project with optional student assignment and project description
   */
  static async createProject(data: CreateProjectRequest, userId: string): Promise<ProjectWithRelations> {
   const project = await prisma.projects.create({
      data: {
        title: data.title,
        supervisor_id: data.supervisor_id,
        opponent_id: data.opponent_id,
        student_id: data.student_id,
        subject: '', // Empty string as default
        subject_id: data.subject_id, // Foreign key to subjects table
        description: data.description,
        main_documentation: data.main_documentation,
        status: data.status,
        year_id: data.year_id,

        // Nested create for project_description if provided
        ...(data.project_description && {
          project_description: {
            create: {
              topic: data.project_description.topic,
              project_goal: data.project_description.project_goal,
              specification: data.project_description.specification,
              needed_output: data.project_description.needed_output,
              schedule: data.project_description.schedule as any || [],
              grading_criteria: [],
              grading_notes: undefined,
            }
          }
        })
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        project_description: true,
      }
    });

    // Invalidate projects list cache
    await cache.delete('projects:all');

    // Log project creation activity
    await ActivityLogService.logActivity(
      project.id,
      userId,
      'project_created',
      'Project created'
    );

    return transformPrismaProject(project);
  }

  /**
   * Get project by ID with relations including student
   */
  /**
   * Get a project by ID with relations
   */
  static async getProjectById(id: bigint): Promise<ProjectWithRelations | null> {
    const cacheKey = `project:${id}`;
    
    // Check cache first
    const cached = await cache.get<ProjectWithRelations>(cacheKey);
    if (cached) {
      return cached;
    }

    const startTime = Date.now();
    
    const project = await prisma.projects.findUnique({
      where: { id: Number(id) },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        project_description: true,
        subjects: true,
        years: true,
      }
    });

    const queryTime = Date.now() - startTime;
    console.log(`[DB Query] Project ${id} took ${queryTime}ms`);

    const result = project ? transformPrismaProject(project) : null;
    
    // Cache for 30 seconds
    if (result) {
      const cacheStartTime = Date.now();
      await cache.set(cacheKey, result, 30);
      const cacheTime = Date.now() - cacheStartTime;
      console.log(`[Redis Cache] Stored in ${cacheTime}ms`);
    }
    
    return result;
  }

  /**
   * Get all projects with relations including student
   * Uses Redis cache to avoid slow database queries (AWS network latency)
   */
  static async getAllProjects(): Promise<ProjectWithRelations[]> {
    const cacheKey = 'projects:all';

    // Try cache first (sub-millisecond lookup)
    const cached = await cache.get<ProjectWithRelations[]>(cacheKey);
    if (cached) {
      console.log('[ProjectService] Cache HIT for all projects');
      return cached;
    }

    console.log('[ProjectService] Cache MISS for all projects, querying database...');

    // Cache miss - query database (2-4s due to AWS network latency)
    const projects = await prisma.projects.findMany({
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        }
      }
    });

    const transformed = projects.map(transformPrismaProject);

    // Cache for 60 seconds (projects list doesn't change frequently)
    await cache.set(cacheKey, transformed, 60);

    return transformed;
  }

  /**
   * Update an existing project including student assignment
   */
  static async updateProject(id: bigint, data: UpdateProjectRequest, userId: string): Promise<ProjectWithRelations | null> {
    // Fetch old project to detect changes
    const oldProject = await prisma.projects.findUnique({
      where: { id: Number(id) },
      select: { status: true },
    });

    const project = await prisma.projects.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        supervisor_id: data.supervisor_id,
        opponent_id: data.opponent_id,
        student_id: data.student_id,
        subject_id: data.subject_id,
        description: data.description,
        main_documentation: data.main_documentation,
        status: data.status,
        year_id: data.year_id,
        ...(data.project_description && {
          project_description: {
            upsert: {
              create: {
                topic: data.project_description.topic,
                project_goal: data.project_description.project_goal,
                specification: data.project_description.specification,
                needed_output: data.project_description.needed_output || [],
                schedule: data.project_description.schedule as any || [],
                grading_criteria: data.project_description.grading_criteria || [],
                grading_notes: data.project_description.grading_notes,
              },
              update: {
                topic: data.project_description.topic,
                project_goal: data.project_description.project_goal,
                specification: data.project_description.specification,
                needed_output: data.project_description.needed_output,
                schedule: data.project_description.schedule as any,
                grading_criteria: data.project_description.grading_criteria,
                grading_notes: data.project_description.grading_notes,
              },
            },
          },
        }),
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        project_description: true,
      }
    });

    // Invalidate cache for this project and the projects list
    await cache.delete(`project:${id}`);
    await cache.delete('projects:all');

    // Log status change if status was updated
    if (data.status && oldProject?.status !== data.status) {
      await ActivityLogService.logActivity(
        id,
        userId,
        'status_changed',
        `Status changed to ${data.status}`,
        { old_status: oldProject?.status, new_status: data.status }
      );
    }

    // Log general update if other fields changed
    if (data.title || data.description || data.main_documentation) {
      await ActivityLogService.logActivity(
        id,
        userId,
        'project_updated',
        'Project details updated'
      );
    }

    return transformPrismaProject(project);
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: bigint): Promise<boolean> {
    const deletedProject = await prisma.projects.delete({
      where: { id: Number(id) },
    });
    
    // Invalidate cache for this project and the projects list
    await cache.delete(`project:${id}`);
    await cache.delete('projects:all');

    return !!deletedProject;
  }

  /**
   * Assign a student to a project (replaces any existing student)
   */
  static async assignStudentToProject(projectId: bigint, studentId: string | null, userId: string): Promise<ProjectWithRelations | null> {
    const project = await prisma.projects.update({
      where: { id: Number(projectId) },
      data: {
        student_id: studentId,
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        }
      }
    });

    // Invalidate cache for this project and the projects list
    await cache.delete(`project:${projectId}`);
    await cache.delete('projects:all');

    // Log student assignment/removal activity
    if (studentId) {
      await ActivityLogService.logActivity(
        projectId,
        userId,
        'student_assigned',
        'Student assigned to project'
      );
    } else {
      await ActivityLogService.logActivity(
        projectId,
        userId,
        'student_removed',
        'Student removed from project'
      );
    }

    return transformPrismaProject(project);
  }

  /**
   * Lock a project manually (supervisor or admin) or automatically (system)
   * Prevents further edits except by admins
   */
  static async lockProject(
    projectId: bigint,
    userId: string,
    reason: 'manual' | 'automatic'
  ): Promise<ProjectWithRelations | null> {
    const project = await prisma.projects.update({
      where: { id: Number(projectId) },
      data: {
        status: 'locked',
        locked_at: new Date(),
        locked_by: userId,
        lock_reason: reason,
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        project_description: true,
        subjects: true,
        years: true,
      }
    });

    // Invalidate caches immediately
    await Promise.all([
      cache.delete(`project:${projectId}`),
      cache.delete('projects:all')
    ]);

    // Log activity
    await ActivityLogService.logActivity(
      projectId,
      userId,
      'project_locked',
      `Project locked (${reason})`,
      { reason, locked_by: userId }
    );

    return transformPrismaProject(project);
  }

  /**
   * Unlock a project (admin only)
   * Allows editing again - reverts to draft
   */
  static async unlockProject(projectId: bigint, userId: string): Promise<ProjectWithRelations | null> {
    const project = await prisma.projects.update({
      where: { id: Number(projectId) },
      data: {
        status: 'draft',
        locked_at: null,
        locked_by: null,
        lock_reason: null,
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        project_description: true,
        subjects: true,
        years: true,
      }
    });

    // Invalidate caches immediately
    await Promise.all([
      cache.delete(`project:${projectId}`),
      cache.delete('projects:all')
    ]);

    // Log activity
    await ActivityLogService.logActivity(
      projectId,
      userId,
      'project_unlocked',
      'Project unlocked by admin'
    );

    return transformPrismaProject(project);
  }

  /**
   * Publish a project (admin only)
   * Changes status from locked to public
   */
  static async publishProject(projectId: bigint): Promise<ProjectWithRelations | null> {
    const project = await prisma.projects.update({
      where: { id: Number(projectId) },
      data: {
        status: 'public',
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            class: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        },
        project_description: true,
        subjects: true,
        years: true,
      }
    });

    // Invalidate caches immediately
    await Promise.all([
      cache.delete(`project:${projectId}`),
      cache.delete('projects:all')
    ]);

    return transformPrismaProject(project);
  }

  /**
   * Auto-lock projects that passed submission deadline
   * Called by cron job hourly
   * Returns count of projects locked
   */
  static async autoLockExpiredProjects(): Promise<number> {
    const now = new Date();

    // Find current year with past submission_date
    const currentYear = await prisma.years.findFirst({
      where: {
        submission_date: { lte: now },
        feedback_date: { gte: now },
      },
    });

    if (!currentYear?.submission_date) {
      console.log('[AutoLock] No current year found with past submission_date');
      return 0;
    }

    // Find draft projects in current year past submission date
    const projectsToLock = await prisma.projects.findMany({
      where: {
        year_id: currentYear.id,
        status: 'draft',
      },
      select: { id: true },
    });

    if (projectsToLock.length === 0) {
      return 0;
    }

    // System user ID for automated actions (use first admin or system ID)
    const systemUser = await prisma.public_users.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    });

    if (!systemUser) {
      console.error('[AutoLock] No admin user found for system operations');
      return 0;
    }

    // Lock all projects in transaction for atomicity
    await prisma.$transaction(
      projectsToLock.map(p =>
        prisma.projects.update({
          where: { id: p.id },
          data: {
            status: 'locked',
            locked_at: now,
            locked_by: systemUser.id,
            lock_reason: 'automatic',
          },
        })
      )
    );

    // Invalidate all project caches
    await cache.delete('projects:all');
    for (const p of projectsToLock) {
      await cache.delete(`project:${p.id}`);
    }

    // Log activity for each locked project
    for (const p of projectsToLock) {
      await ActivityLogService.logActivity(
        BigInt(p.id),
        systemUser.id,
        'project_locked',
        'Project automatically locked (submission deadline passed)',
        { reason: 'automatic', year_id: currentYear.id }
      );
    }

    console.log(`[AutoLock] Locked ${projectsToLock.length} projects past submission deadline (year: ${currentYear.name})`);
    return projectsToLock.length;
  }
}
