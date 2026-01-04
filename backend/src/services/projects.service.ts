import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import { CreateProjectSchema, UpdateProjectSchema } from '../types';
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
    ...projectData
  } = prismaProject;

  return {
    ...projectData,
    student: users_projects_student_idTousers,
    supervisor: users_projects_supervisor_idTousers,
    opponent: users_projects_opponent_idTousers,
  };
}

export class ProjectService {
  /**
   * Create a new project with optional student assignment and project description
   */
  static async createProject(data: CreateProjectRequest): Promise<ProjectWithRelations> {
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
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        project_description: true,
      }
    });

    // Invalidate projects list cache
    await cache.delete('projects:all');

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
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
          }
        },
        project_description: true,
        subjects: true,
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
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
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
  static async updateProject(id: bigint, data: UpdateProjectRequest): Promise<ProjectWithRelations | null> {
    const project = await prisma.projects.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        supervisor_id: data.supervisor_id,
        opponent_id: data.opponent_id,
        student_id: data.student_id,
        subject_id: data.subject_id, // Foreign key to subjects table
        description: data.description,
        main_documentation: data.main_documentation,
        status: data.status,
        year_id: data.year_id,
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: first_name, last_name, avatar_url, role exist only on public_users (via users relation)
          }
        }
      }
    });
    
    // Invalidate cache for this project and the projects list
    await cache.delete(`project:${id}`);
    await cache.delete('projects:all');

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
  static async assignStudentToProject(projectId: bigint, studentId: string | null): Promise<ProjectWithRelations | null> {
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
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });
    
    // Invalidate cache for this project and the projects list
    await cache.delete(`project:${projectId}`);
    await cache.delete('projects:all');

    return transformPrismaProject(project);
  }
}
