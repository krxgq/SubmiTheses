"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoleService {
    static async getAllRoles() {
        return await prisma.roles.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }
    static async getRoleById(id) {
        return await prisma.roles.findUnique({
            where: { id: Number(id) },
        });
    }
    static async createRole(data) {
        return await prisma.roles.create({
            data: {
                name: data.name,
                description: data.description || null,
                updated_at: new Date(),
            },
        });
    }
    static async updateRole(id, data) {
        return await prisma.roles.update({
            where: { id: Number(id) },
            data: {
                name: data.name,
                description: data.description !== undefined ? data.description : undefined,
            },
        });
    }
    static async deleteRole(id) {
        try {
            const deleted = await prisma.roles.delete({
                where: { id: Number(id) },
            });
            return !!deleted;
        }
        catch (error) {
            return false;
        }
    }
}
exports.RoleService = RoleService;
