import { PrismaClient } from '@prisma/client';
import { CreateProjectSchema, UpdateProjectSchema, AddStudentToProjectSchema, UpdateProjectStudentsSchema } from '../types';
import type { components } from '../types/api';

const prisma = new PrismaClient();

// Types from OpenAPI spec
type Project = components['schemas']['Project'];
type CreateProject = components['schemas']['CreateProject'];
type UpdateProject = components['schemas']['UpdateProject'];
type SchoolUser = components['schemas']['SchoolUser'];
type ProjectStudent = components['schemas']['ProjectStudent'];

export class ProjectService {
  static async createProject(data: CreateProject): Promise<Project> {
   const project = await prisma.projects.create({
      data: {
        title: data.title,
        supervisor_id: Number(data.supervisor_id),
        opponent_id: Number(data.opponent_id),
        subject: data.subject,
        description: data.description,
        main_document: data.main_document,
        locked_until: data.locked_until ? new Date(data.locked_until) : null,
        status: data.status || 'draft',
      },
      include: {
        project_students: {
          include: {
            students: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              }
            }
          }
        },
        school_users_projects_supervisor_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        school_users_projects_opponent_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });
    return project as Project;
  }

  static async getProjectById(id: bigint): Promise<Project | null> {
    const project = await prisma.projects.findUnique({
      where: { id: Number(id) },
      include: {
        project_students: {
          include: {
            students: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              }
            }
          }
        },
        school_users_projects_supervisor_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        school_users_projects_opponent_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });
    return project as Project | null;
  }

  static async getAllProjects(): Promise<Project[]> {
    const projects = await prisma.projects.findMany({
      include: {
        project_students: {
          include: {
            students: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              }
            }
          }
        },
        school_users_projects_supervisor_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        school_users_projects_opponent_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });
    return projects as Project[];
  }

  static async updateProject(id: bigint, data: UpdateProject): Promise<Project | null> {
    const project = await prisma.projects.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        supervisor_id: data.supervisor_id ? Number(data.supervisor_id) : undefined,
        opponent_id: data.opponent_id ? Number(data.opponent_id) : undefined,
        subject: data.subject,
        description: data.description,
        main_document: data.main_document,
        locked_until: data.locked_until ? new Date(data.locked_until) : undefined,
        status: data.status,
      },
      include: {
        project_students: {
          include: {
            students: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              }
            }
          }
        },
        school_users_projects_supervisor_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        school_users_projects_opponent_idToschool_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });
    return project as Project;
  }

  static async deleteProject(id: bigint): Promise<boolean> {
    const deletedProject = await prisma.projects.delete({
      where: { id: Number(id) },
    });
    return !!deletedProject;
  }

  static async getProjectStudents(projectId: bigint): Promise<SchoolUser[]> {
    const projectStudents = await prisma.project_students.findMany({
      where: { project_id: Number(projectId) },
      include: {
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });
    return projectStudents.map(ps => ps.students) as SchoolUser[];
  }

  static async addStudentToProject(projectId: bigint, studentId: bigint): Promise<ProjectStudent> {
    const projectStudent = await prisma.project_students.create({
      data: {
        project_id: Number(projectId),
        student_id: Number(studentId),
      },
      include: {
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });
    return projectStudent as ProjectStudent;
  }

  static async removeStudentFromProject(projectId: bigint, studentId: bigint): Promise<boolean> {
    const deleted = await prisma.project_students.deleteMany({
      where: {
        project_id: Number(projectId),
        student_id: Number(studentId),
      }
    });
    return deleted.count > 0;
  }

  static async updateProjectStudents(projectId: bigint, studentIds: bigint[]): Promise<SchoolUser[]> {
    await prisma.project_students.deleteMany({
      where: { project_id: Number(projectId) }
    });

    if (studentIds.length > 0) {
      await prisma.project_students.createMany({
        data: studentIds.map(studentId => ({
          project_id: Number(projectId),
          student_id: Number(studentId),
        }))
      });
    }

    return this.getProjectStudents(projectId);
  }
}
