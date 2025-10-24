"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ReviewService {
    static async getReviewsByProjectId(projectId) {
        return await prisma.reviews.findMany({
            where: { project_id: Number(projectId) },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        raw_user_meta_data: true,
                    },
                },
            },
            orderBy: {
                submitted_at: 'desc',
            },
        });
    }
    static async getReviewById(id) {
        return await prisma.reviews.findUnique({
            where: { id: Number(id) },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        raw_user_meta_data: true,
                    },
                },
                projects: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    }
    static async createReview(data) {
        return await prisma.reviews.create({
            data: {
                project_id: Number(data.project_id),
                reviewer_id: data.reviewer_id,
                comments: data.comments,
                updated_at: new Date(),
            },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        raw_user_meta_data: true,
                    },
                },
            },
        });
    }
    static async updateReview(id, data) {
        return await prisma.reviews.update({
            where: { id: Number(id) },
            data: {
                comments: data.comments,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        raw_user_meta_data: true,
                    },
                },
            },
        });
    }
    static async deleteReview(id) {
        try {
            const deleted = await prisma.reviews.delete({
                where: { id: Number(id) },
            });
            return !!deleted;
        }
        catch (error) {
            return false;
        }
    }
}
exports.ReviewService = ReviewService;
