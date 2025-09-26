import { Router } from 'express'
import {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  getStudentsBySchoolId,
  getTeachersBySchoolId,
  getAllUsersBySchoolId,
} from '../controllers/schools.controller'
import { authenticated, isAdmin, belongsToSchool } from '../middleware/auth'

const router = Router()

router.get('/', authenticated, getAllSchools)
router.post('/', authenticated, isAdmin, createSchool)

router.get('/:id', authenticated, belongsToSchool, getSchoolById)
router.put('/:id', authenticated, isAdmin, updateSchool)
router.delete('/:id', authenticated, isAdmin, deleteSchool)

router.get('/:id/students', authenticated, belongsToSchool, getStudentsBySchoolId)
router.get('/:id/teachers', authenticated, belongsToSchool, getTeachersBySchoolId)
router.get('/:id/allUsers', authenticated, belongsToSchool, getAllUsersBySchoolId)

export default router
