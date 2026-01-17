import { Request, Response } from 'express';
import { GradingService } from '../services/grading.service';

/**
 * Get scale set for teacher's role (supervisor or opponent)
 * Returns the appropriate scale set based on teacher's assignment
 */
export async function getTeacherScaleSet(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const teacherId = req.user!.id;

    const scaleSet = await GradingService.getScaleSetForTeacher(projectId, teacherId);

    if (!scaleSet) {
      return res.status(404).json({
        error: 'No scale set found for this project/role combination'
      });
    }

    return res.status(200).json(scaleSet);
  } catch (error: any) {
    console.error('[GradingController] Error fetching scale set:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch scale set' });
  }
}

/**
 * Get teacher's own grades for a project (blind grading)
 * Only returns grades submitted by the requesting teacher
 */
export async function getMyGrades(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const teacherId = req.user!.id;

    const grades = await GradingService.getTeacherGrades(projectId, teacherId);

    return res.status(200).json(grades);
  } catch (error: any) {
    console.error('[GradingController] Error fetching grades:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch grades' });
  }
}

/**
 * Submit/update grades (one or multiple scales at once)
 * Uses upsert logic for atomicity
 */
export async function submitGrades(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const teacherId = req.user!.id;
    const { year_id, grades } = req.body;

    if (!year_id || !grades || !Array.isArray(grades)) {
      return res.status(400).json({
        error: 'year_id and grades array required'
      });
    }

    const result = await GradingService.submitGrades(
      projectId,
      teacherId,
      BigInt(year_id),
      grades
    );

    return res.status(200).json({
      message: 'Grades submitted successfully',
      grades: result
    });
  } catch (error: any) {
    console.error('[GradingController] Error submitting grades:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit grades' });
  }
}

/**
 * Get all project grades (admin or students after feedback_date)
 * Returns grades grouped by reviewer
 */
export async function getAllProjectGrades(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if student can view grades (after feedback_date)
    if (userRole === 'student') {
      const canView = await GradingService.canStudentViewGrades(projectId);
      if (!canView) {
        return res.status(403).json({
          error: 'Grades not yet available. Wait until feedback date.',
          code: 'GRADES_NOT_AVAILABLE'
        });
      }
    }

    const grades = await GradingService.getAllProjectGrades(projectId);

    return res.status(200).json(grades);
  } catch (error: any) {
    console.error('[GradingController] Error fetching all grades:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch grades' });
  }
}
