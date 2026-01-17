import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import type {
  CreateScaleSetRequest,
  UpdateScaleSetRequest,
  AddScaleToSetRequest,
  BulkCloneScaleSetsRequest
} from '@sumbi/shared-types';

// Service class for scale sets CRUD operations
export class ScaleSetsService {
  /**
   * Get all scale sets with relations (years and scales)
   * Complex query with multiple joins - good caching candidate
   */
  static async getAllScaleSets() {
    const cacheKey = 'scale-sets:all';

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const scaleSets = await prisma.scale_sets.findMany({
      orderBy: { name: 'asc' },
      include: {
        years: {
          select: {
            id: true,
            name: true,
          },
        },
        scale_set_scales: {
          include: {
            scales: true,
          },
          orderBy: { display_order: 'asc' },
        },
        _count: {
          select: { scale_set_scales: true },
        },
      },
    });

    // Cache for 10 minutes (scale sets rarely change)
    await cache.set(cacheKey, scaleSets, 600);

    return scaleSets;
  }

  /**
   * Get single scale set by ID with all relations
   */
  static async getScaleSetById(id: bigint) {
    const cacheKey = `scale-set:${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const scaleSet = await prisma.scale_sets.findUnique({
      where: { id },
      include: {
        years: {
          select: {
            id: true,
            name: true,
          },
        },
        scale_set_scales: {
          include: {
            scales: true,
          },
          orderBy: { display_order: 'asc' },
        },
      },
    });

    // Cache for 10 minutes
    if (scaleSet) {
      await cache.set(cacheKey, scaleSet, 600);
    }

    return scaleSet;
  }

  /**
   * Create new scale set (admin only)
   */
  static async createScaleSet(data: CreateScaleSetRequest) {
    const scaleSet = await prisma.scale_sets.create({
      data: {
        name: data.name,
        year_id: data.year_id,
        project_role: data.project_role,
      },
      include: {
        years: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidate scale sets list and year's scale sets cache
    await cache.delete('scale-sets:all');
    await cache.delete(`year:${data.year_id}:scale-sets`);

    return scaleSet;
  }

  /**
   * Update scale set (admin only)
   */
  static async updateScaleSet(id: bigint, data: UpdateScaleSetRequest) {
    // Get the original scale set to find the old year_id for cache invalidation
    const originalScaleSet = await prisma.scale_sets.findUnique({
      where: { id },
      select: { year_id: true },
    });

    const scaleSet = await prisma.scale_sets.update({
      where: { id },
      data,
      include: {
        years: {
          select: {
            id: true,
            name: true,
          },
        },
        scale_set_scales: {
          include: {
            scales: true,
          },
          orderBy: { display_order: 'asc' },
        },
      },
    });

    // Invalidate all scale set related caches
    await cache.delete(`scale-set:${id}`);
    await cache.delete('scale-sets:all');

    // If year_id was changed, invalidate caches for both old and new years
    if (data.year_id && originalScaleSet?.year_id !== data.year_id) {
      if (originalScaleSet?.year_id) {
        await cache.delete(`year:${originalScaleSet.year_id}:scale-sets`);
      }
      await cache.delete(`year:${data.year_id}:scale-sets`);
    } else if (originalScaleSet?.year_id) {
      // If year_id was not changed, still invalidate the cache for that year
      await cache.delete(`year:${originalScaleSet.year_id}:scale-sets`);
    }

    return scaleSet;
  }

  /**
   * Delete scale set (admin only)
   * Cascade will delete associated scale_set_scales records
   */
  static async deleteScaleSet(id: bigint) {
    const scaleSet = await prisma.scale_sets.findUnique({
      where: { id },
      select: { year_id: true },
    });

    if (!scaleSet) {
      throw new Error('Scale set not found');
    }

    const [, deletedScaleSet] = await prisma.$transaction([
      prisma.scale_set_scales.deleteMany({ where: { scale_set_id: id } }),
      prisma.scale_sets.delete({ where: { id } }),
    ]);

    // Invalidate all scale set related caches
    await cache.delete(`scale-set:${id}`);
    await cache.delete('scale-sets:all');
    if (scaleSet.year_id) {
      await cache.delete(`year:${scaleSet.year_id}:scale-sets`);
    }

    return deletedScaleSet;
  }

  /**
   * Add a scale to a scale set (admin only)
   */
  static async addScaleToSet(
    scaleSetId: bigint,
    data: AddScaleToSetRequest
  ) {
    const result = await prisma.scale_set_scales.create({
      data: {
        scale_set_id: scaleSetId,
        scale_id: data.scale_id,
        weight: data.weight,
        display_order: data.display_order,
      },
      include: {
        scales: true,
      },
    });

    // Invalidate scale set caches (adding scales changes the set)
    await cache.delete(`scale-set:${scaleSetId}`);
    await cache.delete('scale-sets:all');

    return result;
  }

  /**
   * Remove a scale from a scale set (admin only)
   */
  static async removeScaleFromSet(scaleSetId: bigint, scaleId: bigint) {
    const result = await prisma.scale_set_scales.deleteMany({
      where: {
        scale_set_id: scaleSetId,
        scale_id: scaleId,
      },
    });

    // Invalidate scale set caches (removing scales changes the set)
    await cache.delete(`scale-set:${scaleSetId}`);
    await cache.delete('scale-sets:all');

    return result;
  }

  /**
   * Update scale weight/order in a scale set (admin only)
   */
  static async updateScaleInSet(
    scaleSetId: bigint,
    scaleId: bigint,
    weight: number,
    displayOrder?: number
  ) {
    // Find the scale_set_scale record
    const record = await prisma.scale_set_scales.findFirst({
      where: {
        scale_set_id: scaleSetId,
        scale_id: scaleId,
      },
    });

    if (!record) {
      throw new Error('Scale not found in scale set');
    }

    const result = await prisma.scale_set_scales.update({
      where: { id: record.id },
      data: {
        weight,
        display_order: displayOrder,
      },
      include: {
        scales: true,
      },
    });

    // Invalidate scale set caches (updating weight/order changes the set)
    await cache.delete(`scale-set:${scaleSetId}`);
    await cache.delete('scale-sets:all');

    return result;
  }

  /**
   * Bulk clone scale sets to a new year (admin only)
   * Creates multiple scale sets with their scales in a single transaction
   */
  static async bulkCloneScaleSets(data: BulkCloneScaleSetsRequest) {
    const { yearId, scaleSetsData } = data;
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const createdScaleSets = [];

      for (const scaleSetData of scaleSetsData) {
        // Create the scale set
        const scaleSet = await tx.scale_sets.create({
          data: {
            name: scaleSetData.name,
            year_id: yearId,
            project_role: scaleSetData.project_role,
          },
        });

        // Add scales to the scale set
        if (scaleSetData.scales.length > 0) {
          await tx.scale_set_scales.createMany({
            data: scaleSetData.scales.map((scale: { scale_id: bigint | number; weight: number; display_order?: number }) => ({
              scale_set_id: scaleSet.id,
              scale_id: scale.scale_id,
              weight: scale.weight,
              display_order: scale.display_order,
            })),
          });
        }

        createdScaleSets.push(scaleSet);
      }

      return createdScaleSets;
    });

    // Invalidate all scale set caches after bulk creation
    await cache.delete('scale-sets:all');
    await cache.delete(`year:${yearId}:scale-sets`);

    return result;
  }
}
