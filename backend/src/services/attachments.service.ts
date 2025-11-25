import { prisma } from '../lib/prisma';
import fs from "fs";

export class AttachmentService {
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

  static async createAttachment(data: {
    project_id: bigint;
    storage_path: string;
    filename: string;
    description?: string;
  }) {
    return await prisma.attachments.create({
      data: {
        project_id: Number(data.project_id),
        storage_path: data.storage_path,
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
   * Upload attachment to local storage (temporary solution)
   * TODO: Replace with cloud storage (Supabase Storage) in the future
   */
  static async uploadAttachment(file: Express.Multer.File, projectId: bigint) {
    // Verify file exists on disk (Multer should have saved it)
    if (!fs.existsSync(file.path)) {
      console.error(`File not found on disk: ${file.path}`);
      return {
        success: false,
        error: "File was not saved to disk by upload middleware",
      };
    }

    console.log(`File has been uploaded successfully: ${file.path}`);
    return {
      success: true,
      path: file.path,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

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
