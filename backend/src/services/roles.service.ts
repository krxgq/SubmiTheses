import { prisma } from '../lib/prisma';

export class RoleService {
  static async getAllRoles() {
    return await prisma.roles.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async getRoleById(id: bigint) {
    return await prisma.roles.findUnique({
      where: { id: Number(id) },
    });
  }

  static async createRole(data: {
    name: string;
    description?: string;
  }) {
    return await prisma.roles.create({
      data: {
        name: data.name,
        description: data.description || null,
        updated_at: new Date(),
      },
    });
  }

  static async updateRole(id: bigint, data: {
    name?: string;
    description?: string;
  }) {
    return await prisma.roles.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description !== undefined ? data.description : undefined,
      },
    });
  }

  static async deleteRole(id: bigint) {
    try {
      const deleted = await prisma.roles.delete({
        where: { id: Number(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}
