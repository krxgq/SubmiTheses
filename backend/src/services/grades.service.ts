import { prisma } from '../lib/prisma';

export class GradeService {
  static async getGradesByProjectId(projectId: bigint) {
    return await prisma.grades.findMany({
      where: { project_id: Number(projectId) },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
          },
        },
        scales: {
          select: {
            id: true,
            name: true,
            desc: true,
            maxVal: true,
          },
        },
        years: {
          select: {
            id: true,
            assignment_date: true,
            submission_date: true,
            feedback_date: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  static async getGradeById(id: bigint) {
    return await prisma.grades.findUnique({
      where: { id: Number(id) },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
          },
        },
        projects: {
          select: {
            id: true,
            title: true,
          },
        },
        scales: true,
        years: true,
      },
    });
  }

  static async createGrade(data: {
    project_id: bigint;
    reviewer_id: string;
    value: bigint;
    year_id: bigint;
    scale_id?: bigint;
  }) {
    return await prisma.grades.create({
      data: {
        project_id: Number(data.project_id),
        reviewer_id: data.reviewer_id,
        value: Number(data.value),
        year_id: Number(data.year_id),
        scale_id: data.scale_id ? Number(data.scale_id) : null,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
          },
        },
        scales: true,
      },
    });
  }

  static async updateGrade(id: bigint, data: { value: bigint; scale_id?: bigint }) {
    return await prisma.grades.update({
      where: { id: Number(id) },
      data: {
        value: Number(data.value),
        scale_id: data.scale_id !== undefined ? Number(data.scale_id) : undefined,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
          },
        },
        scales: true,
      },
    });
  }

  static async deleteGrade(id: bigint) {
    try {
      const deleted = await prisma.grades.delete({
        where: { id: Number(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}
