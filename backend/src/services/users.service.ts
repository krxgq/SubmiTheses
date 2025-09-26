import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
    static async createUser(data: any) {
        /* const user = await prisma.user.create({ data }); */
    }
    static async getAllUsers() {
        return await prisma.school_users.findMany();
    }
}