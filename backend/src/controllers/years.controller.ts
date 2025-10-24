import { Request, Response } from 'express';
import { YearService } from '../services/years.service';

export async function getAllYears(req: Request, res: Response) {
  try {
    const years = await YearService.getAllYears();
    return res.status(200).json(years);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch years' });
  }
}

export async function getYearById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const year = await YearService.getYearById(id);

    if (!year) {
      return res.status(404).json({ error: 'Year not found' });
    }

    return res.status(200).json(year);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch year' });
  }
}

export async function createYear(req: Request, res: Response) {
  try {
    const year = await YearService.createYear({
      assignment_date: new Date(req.body.assignment_date),
      submission_date: new Date(req.body.submission_date),
      feedback_date: new Date(req.body.feedback_date),
    });

    return res.status(201).json(year);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create year' });
  }
}

export async function updateYear(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);

    const year = await YearService.updateYear(id, {
      assignment_date: req.body.assignment_date ? new Date(req.body.assignment_date) : undefined,
      submission_date: req.body.submission_date ? new Date(req.body.submission_date) : undefined,
      feedback_date: req.body.feedback_date ? new Date(req.body.feedback_date) : undefined,
    });

    if (!year) {
      return res.status(404).json({ error: 'Year not found' });
    }

    return res.status(200).json(year);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update year' });
  }
}

export async function deleteYear(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const deleted = await YearService.deleteYear(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Year not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete year' });
  }
}
