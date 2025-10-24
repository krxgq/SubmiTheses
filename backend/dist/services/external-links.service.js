"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalLinkService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ExternalLinkService {
    static async getExternalLinksByProjectId(projectId) {
        return await prisma.external_links.findMany({
            where: { project_id: Number(projectId) },
            orderBy: {
                added_at: 'desc',
            },
        });
    }
    static async getExternalLinkById(id) {
        return await prisma.external_links.findUnique({
            where: { id: Number(id) },
        });
    }
    static async createExternalLink(data) {
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
    static async updateExternalLink(id, data) {
        return await prisma.external_links.update({
            where: { id: Number(id) },
            data: {
                url: data.url,
                title: data.title,
                description: data.description,
            },
        });
    }
    static async deleteExternalLink(id) {
        try {
            const deleted = await prisma.external_links.delete({
                where: { id: Number(id) },
            });
            return !!deleted;
        }
        catch (error) {
            return false;
        }
    }
}
exports.ExternalLinkService = ExternalLinkService;
