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
   * Create a new project with an optional student assignment
   */
  static async createProject(data: CreateProjectRequest): Promise<ProjectWithRelations> {
   const project = await prisma.projects.create({
      data: {
        title: data.title,
        supervisor_id: data.supervisor_id,
        opponent_id: data.opponent_id,
        student_id: data.student_id,
        subject: data.subject,
        description: data.description,
        main_documentation: data.main_documentation,
        status: data.status,
        year_id: data.year_id,
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        }
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
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        }
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
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
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
        subject: data.subject,
        description: data.description,
        main_documentation: data.main_documentation,
        status: data.status,
        year_id: data.year_id,
      },
      include: {
        users_projects_student_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
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
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_supervisor_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        },
        users_projects_opponent_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
            role: true,
          }
        }
      }
    });
    return transformPrismaProject(project);
  }
}
