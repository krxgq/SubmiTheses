import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import type { CreateYearRequest, UpdateYearRequest } from '@sumbi/shared-types';

export class YearService {
  // Cache all years list - rarely changes, accessed frequently
  static async getAllYears() {
    const cacheKey = 'years:all';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const years = await prisma.years.findMany({
      orderBy: {
        assignment_date: 'desc',
      },
    });

    // Cache for 1 hour (years don't change frequently)
    await cache.set(cacheKey, years, 3600);

    return years;
  }

  /**
   * Get the current academic year based on today's date
   * Returns the year where today's date is between assignment_date and feedback_date
   * If no matching year found, returns the most recent year
   */
  static async getCurrentYear() {
    const cacheKey = 'year:current';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const now = new Date();

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

    const result = currentYear || await prisma.years.findFirst({
      orderBy: {
        assignment_date: 'desc',
      },
    });

    // Cache for 30 minutes (current year changes infrequently)
    if (result) {
      await cache.set(cacheKey, result, 1800);
    }

    return result;
  }

  // Cache individual year by ID - includes grades relation
  static async getYearById(id: bigint) {
    const cacheKey = `year:${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const year = await prisma.years.findUnique({
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

    // Cache for 30 minutes
    if (year) {
      await cache.set(cacheKey, year, 1800);
    }

    return year;
  }

  static async createYear(data: CreateYearRequest) {
    const year = await prisma.years.create({
      data: {
        name: data.name,
        assignment_date: data.assignment_date,
        submission_date: data.submission_date,
        feedback_date: data.feedback_date,
      },
    });

    // Invalidate years list and current year cache
    await cache.delete('years:all');
    await cache.delete('year:current');

    return year;
  }

  static async updateYear(id: bigint, data: UpdateYearRequest) {
    const year = await prisma.years.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        assignment_date: data.assignment_date,
        submission_date: data.submission_date,
        feedback_date: data.feedback_date,
      },
    });

    // Invalidate all year-related caches
    await cache.delete(`year:${id}`);
    await cache.delete('years:all');
    await cache.delete('year:current');
    await cache.delete(`year:${id}:scale-sets`);

    return year;
  }

  static async deleteYear(id: bigint) {
    try {
      const deleted = await prisma.years.delete({
        where: { id: Number(id) },
      });

      // Invalidate all year-related caches
      await cache.delete(`year:${id}`);
      await cache.delete('years:all');
      await cache.delete('year:current');
      await cache.delete(`year:${id}:scale-sets`);

      return !!deleted;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all scale sets with their scales for a specific year
   * Used for cloning scale sets to a new year
   */
  static async getScaleSetsForYear(yearId: bigint) {
    const cacheKey = `year:${yearId}:scale-sets`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const scaleSets = await prisma.scale_sets.findMany({
      where: { year_id: yearId },
      include: {
        scale_set_scales: {
          include: {
            scales: true,
          },
          orderBy: { display_order: 'asc' },
        },
      },
      orderBy: { project_role: 'asc' }, // supervisor first, then opponent
    });

    // Cache for 30 minutes (scale sets rarely change)
    await cache.set(cacheKey, scaleSets, 1800);

    return scaleSets;
  }

  /**
   * Generate the next academic year name based on the latest year
   * Parses format "YYYY/YYYY" and increments both years
   */
  static async generateNextYearName(): Promise<string> {
    // Get the most recent year by assignment_date
    const latestYear = await prisma.years.findFirst({
      orderBy: { assignment_date: 'desc' },
    });

    if (!latestYear?.name) {
      // If no previous year exists, suggest current academic year
      const now = new Date();
      const currentYear = now.getFullYear();
      const nextYear = currentYear + 1;
      return `${currentYear}/${nextYear}`;
    }

    // Parse existing format like "2024/2025"
    const match = latestYear.name.match(/(\d{4})\/(\d{4})/);
    if (match) {
      const startYear = parseInt(match[1]);
      const endYear = parseInt(match[2]);
      return `${startYear + 1}/${endYear + 1}`;
    }

    // Fallback: just increment year
    const yearMatch = latestYear.name.match(/\d{4}/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      return `${year + 1}/${year + 2}`;
    }

    // Ultimate fallback
    const now = new Date();
    const currentYear = now.getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  }
}
