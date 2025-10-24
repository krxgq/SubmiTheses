import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExternalLinkService {
  static async getExternalLinksByProjectId(projectId: bigint) {
    return await prisma.external_links.findMany({
      where: { project_id: Number(projectId) },
      orderBy: {
        added_at: 'desc',
      },
    });
  }

  static async getExternalLinkById(id: bigint) {
    return await prisma.external_links.findUnique({
      where: { id: Number(id) },
    });
  }

  static async createExternalLink(data: {
    project_id: bigint;
    url: string;
    title?: string;
    description?: string;
  }) {
    return await prisma.external_links.create({
      data: {
        project_id: Number(data.project_id),
        url: data.url,
        title: data.title || null,
        description: data.description || null,
        updated_at: new Date(),
      },
    });
  }

  static async updateExternalLink(
    id: bigint,
    data: {
      url?: string;
      title?: string;
      description?: string;
    }
  ) {
    return await prisma.external_links.update({
      where: { id: Number(id) },
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
      },
    });
  }

  static async deleteExternalLink(id: bigint) {
    try {
      const deleted = await prisma.external_links.delete({
        where: { id: Number(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}
