"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AttachmentService {
    static async getAttachmentsByProjectId(projectId) {
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
    static async getAttachmentById(id) {
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
    static async createAttachment(data) {
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
    static async deleteAttachment(id) {
        try {
            const deleted = await prisma.attachments.delete({
                where: { id: Number(id) },
            });
            return deleted;
        }
        catch (error) {
            return null;
        }
    }
}
exports.AttachmentService = AttachmentService;
