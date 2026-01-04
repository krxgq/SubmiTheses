import { Request, Response, NextFunction } from 'express';
import { ScaleSetsService } from '../services/scale-sets.service';

// Controller for scale sets endpoints - handles requests and responses
export class ScaleSetsController {
  /**
   * GET /scale-sets - Get all scale sets
   * Accessible to authenticated users
   */
  static async getAllScaleSets(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const scaleSets = await ScaleSetsService.getAllScaleSets();
      res.json(scaleSets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /scale-sets/:id - Get scale set by ID
   */
  static async getScaleSetById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      const scaleSet = await ScaleSetsService.getScaleSetById(id);

      if (!scaleSet) {
        return res.status(404).json({ message: 'Scale set not found' });
      }

      res.json(scaleSet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /scale-sets - Create new scale set (admin only)
   */
  static async createScaleSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const scaleSet = await ScaleSetsService.createScaleSet(req.body);
      res.status(201).json(scaleSet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /scale-sets/:id - Update scale set (admin only)
   */
  static async updateScaleSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      const scaleSet = await ScaleSetsService.updateScaleSet(id, req.body);
      res.json(scaleSet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /scale-sets/:id - Delete scale set (admin only)
   */
  static async deleteScaleSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = BigInt(req.params.id);
      await ScaleSetsService.deleteScaleSet(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /scale-sets/:id/scales - Add scale to scale set (admin only)
   */
  static async addScaleToSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const scaleSetId = BigInt(req.params.id);
      const scaleSetScale = await ScaleSetsService.addScaleToSet(
        scaleSetId,
        req.body
      );
      res.status(201).json(scaleSetScale);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /scale-sets/:id/scales/:scaleId - Remove scale from scale set (admin only)
   */
  static async removeScaleFromSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const scaleSetId = BigInt(req.params.id);
      const scaleId = BigInt(req.params.scaleId);
      await ScaleSetsService.removeScaleFromSet(scaleSetId, scaleId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /scale-sets/:id/scales/:scaleId - Update scale weight/order (admin only)
   */
  static async updateScaleInSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const scaleSetId = BigInt(req.params.id);
      const scaleId = BigInt(req.params.scaleId);
      const { weight, display_order } = req.body;

      const updated = await ScaleSetsService.updateScaleInSet(
        scaleSetId,
        scaleId,
        weight,
        display_order
      );

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /scale-sets/bulk-clone - Clone multiple scale sets to a new year (admin only)
   */
  static async bulkCloneScaleSets(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { yearId, scaleSetsData } = req.body;
      const created = await ScaleSetsService.bulkCloneScaleSets({
        yearId: BigInt(yearId),
        scaleSetsData
      });
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }
}
