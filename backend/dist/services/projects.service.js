"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ProjectService {
    static async createProject(data) {
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
        return project;
    }
    static async getProjectById(id) {
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
        return project;
    }
    static async getAllProjects() {
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
        return projects;
    }
    static async updateProject(id, data) {
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
        return project;
    }
    static async deleteProject(id) {
        const deletedProject = await prisma.projects.delete({
            where: { id: Number(id) },
        });
        return !!deletedProject;
    }
    static async getProjectStudents(projectId) {
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
        return projectStudents.map(ps => ps.students);
    }
    static async addStudentToProject(projectId, studentId) {
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
        return projectStudent;
    }
    static async removeStudentFromProject(projectId, studentId) {
        const deleted = await prisma.project_students.deleteMany({
            where: {
                project_id: Number(projectId),
                student_id: Number(studentId),
            }
        });
        return deleted.count > 0;
    }
    static async updateProjectStudents(projectId, studentIds) {
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
exports.ProjectService = ProjectService;
