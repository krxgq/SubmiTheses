import { PrismaClient } from '@prisma/client';
import { CreateSchoolSchema, UpdateSchoolSchema, type CreateSchool, type UpdateSchool, type School } from '../types';

const prisma = new PrismaClient();

export class SchoolService {
  static async createSchool(data: CreateSchool): Promise<School> {
    const validatedData = CreateSchoolSchema.parse(data);
    
    try {
      const school = await prisma.schools.create({
        data: validatedData,
      });
      
      return school as School;
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new Error('A school with this domain already exists');
      }
      throw error;
    }
  }

  static async getSchoolById(id: bigint): Promise<School | null> {
    const school = await prisma.schools.findUnique({
      where: { id },
    });
    
    return school as School | null;
  }

    static async getSchoolByDomain(domain: string): Promise<School | null> {
      const school = await prisma.schools.findUnique({
        where: { domain },
      });
      
      return school as School | null;
    }

  static async getAllSchools(): Promise<School[]> {
    const schools = await prisma.schools.findMany({
      orderBy: { created_at: 'desc' },
    });
    
    return schools as School[];
  }

  static async updateSchool(id: bigint, data: UpdateSchool): Promise<School | null> {
    const validatedData = UpdateSchoolSchema.parse(data);
    
    try {
      const school = await prisma.schools.update({
        where: { id },
        data: validatedData,
      });
      
      return school as School;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return null;
      }
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new Error('A school with this domain already exists');
      }
      throw error;
    }
  }

  static async deleteSchool(id: bigint): Promise<boolean> {
    try {
      await prisma.schools.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      throw error;
    }
  }


  static async getStudentsBySchoolId(id: bigint) {
    try {
      const students = await prisma.school_users.findMany({
        where: { 
          school_id: id,
          user_roles: {
            name: 'student'
          }
        },
        include: {
          user_roles: true,
        },
      });
      
      return students.length > 0 ? students : null;
    } catch (error) {
      throw error;
    }
  }

  static async getTeachersBySchoolId(id: bigint) {
    try {
      const teachers = await prisma.school_users.findMany({
        where: { 
          school_id: id,
          user_roles: {
            name: {
              in: ['supervisor', 'teacher', 'opponent']
            }
          }
        },
        include: {
          user_roles: true,
        },
      });
      
      return teachers.length > 0 ? teachers : null;
    } catch (error) {
      throw error;
    }
  }
  static async getAllUsersBySchoolId(id: bigint) {
    try {
      const users = await prisma.school_users.findMany({
        where: { 
          school_id: id,
        },
        include: {
          user_roles: true,
        },
      });
      
      return users.length > 0 ? users : null;
    } catch (error) {
      throw error;
    }
  }
}
