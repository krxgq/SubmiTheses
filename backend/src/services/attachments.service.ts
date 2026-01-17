import { prisma } from '../lib/prisma';
import type { CreateAttachmentRequest } from '@sumbi/shared-types';

/**
 * AttachmentService - Manages attachment metadata in database
 * Note: Actual file storage is handled by S3Service
 */
export class AttachmentService {
  /**
   * Get all attachments for a project
   */
  static async getAttachmentsByProjectId(projectId: bigint) {
    return await prisma.attachments.findMany({
      where: { project_id: Number(projectId) },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        uploaded_at: "desc",
      },
    });
  }

  /**
   * Get a specific attachment by ID
   */
  static async getAttachmentById(id: bigint) {
    return await prisma.attachments.findUnique({
      where: { id: Number(id) },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Create attachment metadata record
   * storage_path should be S3 key (e.g., "projects/123/1234567890-file.pdf")
   */
  static async createAttachment(data: CreateAttachmentRequest & { project_id: bigint }) {
    return await prisma.attachments.create({
      data: {
        project_id: Number(data.project_id),
        storage_path: data.storage_path, // S3 key
        filename: data.filename,
        description: data.description || null,
        updated_at: new Date(),
      },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Delete attachment metadata from database
   */
  static async deleteAttachment(id: bigint) {
    try {
      const deleted = await prisma.attachments.delete({
        where: { id: Number(id) },
      });
      return deleted;
    } catch (error) {
      return null;
    }
  }
}
