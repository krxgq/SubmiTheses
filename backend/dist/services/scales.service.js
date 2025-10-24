"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ScaleService {
    static async getAllScales() {
        return await prisma.scales.findMany({
            include: {
                scale_set_scales: {
                    include: {
                        scale_sets: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    static async getScaleById(id) {
        return await prisma.scales.findUnique({
            where: { id: Number(id) },
            include: {
                scale_set_scales: {
                    include: {
                        scale_sets: true,
                    },
                },
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
    }
    static async createScale(data) {
        return await prisma.scales.create({
            data: {
                name: data.name,
                desc: data.desc || null,
                maxVal: Number(data.maxVal),
            },
        });
    }
    static async updateScale(id, data) {
        return await prisma.scales.update({
            where: { id: Number(id) },
            data: {
                name: data.name,
                desc: data.desc !== undefined ? data.desc : undefined,
                maxVal: data.maxVal !== undefined ? Number(data.maxVal) : undefined,
            },
        });
    }
    static async deleteScale(id) {
        try {
            const deleted = await prisma.scales.delete({
                where: { id: Number(id) },
            });
            return !!deleted;
        }
        catch (error) {
            return false;
        }
    }
}
exports.ScaleService = ScaleService;
