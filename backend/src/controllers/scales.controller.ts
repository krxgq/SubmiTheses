import { Request, Response } from 'express';
import { ScaleService } from '../services/scales.service';

export async function getAllScales(req: Request, res: Response) {
  try {
    const scales = await ScaleService.getAllScales();
    return res.status(200).json(scales);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch scales' });
  }
}

export async function getScaleById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const scale = await ScaleService.getScaleById(id);

    if (!scale) {
      return res.status(404).json({ error: 'Scale not found' });
    }

    return res.status(200).json(scale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch scale' });
  }
}

export async function createScale(req: Request, res: Response) {
  try {
    const scale = await ScaleService.createScale({
      name: req.body.name,
      desc: req.body.desc,
      maxVal: BigInt(req.body.maxVal),
    });

    return res.status(201).json(scale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create scale' });
  }
}

export async function updateScale(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);

    const scale = await ScaleService.updateScale(id, {
      name: req.body.name,
      desc: req.body.desc,
      maxVal: req.body.maxVal ? BigInt(req.body.maxVal) : undefined,
    });

    if (!scale) {
      return res.status(404).json({ error: 'Scale not found' });
    }

    return res.status(200).json(scale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update scale' });
  }
}

export async function deleteScale(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const deleted = await ScaleService.deleteScale(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Scale not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete scale' });
  }
}
