import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        uploaded_at: 'desc',
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
