import { Request, Response, NextFunction } from 'express';
import { SubjectsService } from '../services/subjects.service';

export class SubjectsController {
  /**
   * GET /subjects - Get all active subjects
   * Public endpoint for dropdown selection
   */
  static async getActiveSubjects(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const subjects = await SubjectsService.getActiveSubjects();
      res.json(subjects);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /subjects/all - Get all subjects (admin only)
   */
  static async getAllSubjects(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const subjects = await SubjectsService.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /subjects/:id - Get subject by ID
   */
  static async getSubjectById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      const subject = await SubjectsService.getSubjectById(id);

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json(subject);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /subjects - Create new subject (admin only)
   */
  static async createSubject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const subject = await SubjectsService.createSubject(req.body);
      res.status(201).json(subject);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /subjects/:id - Update subject (admin only)
   */
  static async updateSubject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      const subject = await SubjectsService.updateSubject(id, req.body);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /subjects/:id - Delete subject (admin only)
   */
  static async deleteSubject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      await SubjectsService.deleteSubject(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /subjects/:id/deactivate - Deactivate subject (admin only)
   */
  static async deactivateSubject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      const subject = await SubjectsService.deactivateSubject(id);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /subjects/:id/activate - Activate subject (admin only)
   */
  static async activateSubject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      const subject = await SubjectsService.activateSubject(id);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  }
}
