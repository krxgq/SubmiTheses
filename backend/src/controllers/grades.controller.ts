import { Request, Response } from 'express';
import { GradeService } from '../services/grades.service';

export async function getProjectGrades(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const grades = await GradeService.getGradesByProjectId(projectId);
    return res.status(200).json(grades);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch grades' });
  }
}

export async function getGradeById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.gradeId);
    const grade = await GradeService.getGradeById(id);

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    return res.status(200).json(grade);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch grade' });
  }
}

export async function createGrade(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);

    const grade = await GradeService.createGrade({
      project_id: projectId,
      reviewer_id: req.body.reviewer_id,
      value: BigInt(req.body.value),
      year_id: BigInt(req.body.year_id),
      scale_id: req.body.scale_id ? BigInt(req.body.scale_id) : undefined,
    });

    return res.status(201).json(grade);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create grade' });
  }
}

export async function updateGrade(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.gradeId);

    // Ownership check: only the reviewer who created it or an admin can update
    const existing = await GradeService.getGradeById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    if (existing.reviewer_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this grade' });
    }

    const grade = await GradeService.updateGrade(id, {
      value: BigInt(req.body.value),
      scale_id: req.body.scale_id ? BigInt(req.body.scale_id) : undefined,
    });

    return res.status(200).json(grade);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update grade' });
  }
}

export async function deleteGrade(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.gradeId);

    // Ownership check: only the reviewer who created it or an admin can delete
    const existing = await GradeService.getGradeById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    if (existing.reviewer_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this grade' });
    }

    await GradeService.deleteGrade(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete grade' });
  }
}
