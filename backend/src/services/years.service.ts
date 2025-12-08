import { prisma } from '../lib/prisma';

export class YearService {
  static async getAllYears() {
    return await prisma.years.findMany({
      orderBy: {
        assignment_date: 'desc',
      },
    });
  }

  /**
   * Get the current academic year based on today's date
   * Returns the year where today's date is between assignment_date and feedback_date
   * If no matching year found, returns the most recent year
   */
  static async getCurrentYear() {
    const now = new Date();
    
    // First, try to find a year where current date is within the year's timeframe
    const currentYear = await prisma.years.findFirst({
      where: {
        AND: [
          { assignment_date: { lte: now } },
          { feedback_date: { gte: now } },
        ],
      },
      orderBy: {
        assignment_date: 'desc',
      },
    });

    // If found, return it
    if (currentYear) {
      return currentYear;
    }

    // Otherwise, return the most recent year (by assignment_date)
    return await prisma.years.findFirst({
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
