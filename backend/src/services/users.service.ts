import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
  static async getAllUsers() {
    return await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        created_at: true,
        updated_at: true,
        last_sign_in_at: true,
        raw_user_meta_data: true,
        email_confirmed_at: true,
      },
    });
  }

  static async getUserById(id: string) {
    return await prisma.users.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        email: true,
        created_at: true,
        updated_at: true,
        last_sign_in_at: true,
        raw_user_meta_data: true,
        raw_app_meta_data: true,
        email_confirmed_at: true,
      },
    });
  }

  static async updateUser(id: string, data: any) {
    // Get existing user to merge metadata
    const existingUser = await prisma.users.findUnique({
      where: { id: String(id) },
      select: {
        raw_user_meta_data: true,
        raw_app_meta_data: true,
      },
    });

    if (!existingUser) {
      return null;
    }

    // Merge metadata instead of replacing
    const mergedUserMetadata = {
      ...(existingUser.raw_user_meta_data as object || {}),
      ...(data.raw_user_meta_data || {}),
    };

    const mergedAppMetadata = {
      ...(existingUser.raw_app_meta_data as object || {}),
      ...(data.raw_app_meta_data || {}),
    };

    return await prisma.users.update({
      where: { id: String(id) },
      data: {
        email: data.email,
        raw_user_meta_data: mergedUserMetadata,
        raw_app_meta_data: mergedAppMetadata,
      },
      select: {
        id: true,
        email: true,
        created_at: true,
        updated_at: true,
        last_sign_in_at: true,
        raw_user_meta_data: true,
        email_confirmed_at: true,
      },
    });
  }

  static async deleteUser(id: string) {
    try {
      const deleted = await prisma.users.delete({
        where: { id: String(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}