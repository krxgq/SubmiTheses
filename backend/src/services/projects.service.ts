import { prisma } from '../lib/prisma';
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
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        project_description: true,
      }
    });
    return transformPrismaProject(project);
  }

  /**
   * Get project by ID with relations including student
   */
  static async getProjectById(id: bigint): Promise<ProjectWithRelations | null> {
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
    return project ? transformPrismaProject(project) : null;
  }

  /**
   * Get all projects with relations including student
   */
  static async getAllProjects(): Promise<ProjectWithRelations[]> {
    const projects = await prisma.projects.findMany({
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        }
      }
    });
    return projects.map(transformPrismaProject);
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
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        }
      }
    });
    return transformPrismaProject(project);
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: bigint): Promise<boolean> {
    const deletedProject = await prisma.projects.delete({
      where: { id: Number(id) },
    });
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
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            email: true,
            // Note: full_name, avatar_url, role exist only on public_users (via users relation)
          }
        }
      }
    });
    return transformPrismaProject(project);
  }
}
