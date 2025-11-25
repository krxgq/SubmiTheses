import { prisma } from '../lib/prisma';

export class YearService {
  static async getAllYears() {
    return await prisma.years.findMany({
      orderBy: {
        assignment_date: 'desc',
      },
    });
  }

  static async getYearById(id: bigint) {
    return await prisma.years.findUnique({
      where: { id: Number(id) },
      include: {
        grades: {
          select: {
            id: true,
            value: true,
            project_id: true,
            reviewer_id: true,
          },
        },
      },
    });
  }

  static async createYear(data: {
    assignment_date: Date;
    submission_date: Date;
    feedback_date: Date;
  }) {
    return await prisma.years.create({
      data: {
        assignment_date: data.assignment_date,
        submission_date: data.submission_date,
        feedback_date: data.feedback_date,
      },
    });
  }

  static async updateYear(id: bigint, data: {
    assignment_date?: Date;
    submission_date?: Date;
    feedback_date?: Date;
  }) {
    return await prisma.years.update({
      where: { id: Number(id) },
      data: {
        assignment_date: data.assignment_date,
        submission_date: data.submission_date,
        feedback_date: data.feedback_date,
      },
    });
  }

  static async deleteYear(id: bigint) {
    try {
      const deleted = await prisma.years.delete({
        where: { id: Number(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}
