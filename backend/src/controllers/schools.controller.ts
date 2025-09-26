import { Request, Response } from 'express'
import { SchoolService } from '../services/school.service'

export async function createSchool(req: Request, res: Response) {
  const school = await SchoolService.createSchool(req.body)
  return res.status(201).json(school)
}

export async function getAllSchools(req: Request, res: Response) {
  const schools = await SchoolService.getAllSchools()
  return res.status(200).json(schools)
}

export async function getSchoolById(req: Request, res: Response) {
  const id = BigInt(req.params.id)
  const school = await SchoolService.getSchoolById(id)

  if (!school) {
    return res.status(404).json({ error: 'School not found' })
  }

  return res.status(200).json(school)
}

export async function updateSchool(req: Request, res: Response) {
  const id = BigInt(req.params.id)
  const updatedSchool = await SchoolService.updateSchool(id, req.body)

  if (!updatedSchool) {
    return res.status(404).json({ error: 'School not found' })
  }

  return res.status(200).json(updatedSchool)
}

export async function deleteSchool(req: Request, res: Response) {
  const id = BigInt(req.params.id)
  const deleted = await SchoolService.deleteSchool(id)

  if (!deleted) {
    return res.status(404).json({ error: 'School not found' })
  }

  return res.status(200).json({ message: 'School deleted successfully' })
}
export async function getStudentsBySchoolId(req: Request, res: Response) {
  const id = BigInt(req.params.id)
  const students = await SchoolService.getStudentsBySchoolId(id)

  if (!students) {
    return res.status(404).json({ error: 'No students found for this school' })
  }

  return res.status(200).json(students)
}
export async function getTeachersBySchoolId(req: Request, res: Response) {
  const id = BigInt(req.params.id)
  const teachers = await SchoolService.getTeachersBySchoolId(id)

  if (!teachers) {
    return res.status(404).json({ error: 'No teachers found for this school' })
  }

  return res.status(200).json(teachers)
}
export async function getAllUsersBySchoolId(req: Request, res: Response) {
  const id = BigInt(req.params.id)
  const users = await SchoolService.getAllUsersBySchoolId(id)

  if (!users) {
    return res.status(404).json({ error: 'No users found for this school' })
  }

  return res.status(200).json(users)
}