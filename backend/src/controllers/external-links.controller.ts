import { Request, Response } from 'express';
import { ExternalLinkService } from '../services/external-links.service';

export async function getProjectExternalLinks(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const links = await ExternalLinkService.getExternalLinksByProjectId(projectId);
    return res.status(200).json(links);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch external links' });
  }
}

export async function getExternalLinkById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.linkId);
    const link = await ExternalLinkService.getExternalLinkById(id);

    if (!link) {
      return res.status(404).json({ error: 'External link not found' });
    }

    return res.status(200).json(link);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch external link' });
  }
}

export async function createExternalLink(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);

    const link = await ExternalLinkService.createExternalLink({
      project_id: projectId,
      url: req.body.url,
      title: req.body.title,
      description: req.body.description,
    });

    return res.status(201).json(link);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create external link' });
  }
}

export async function updateExternalLink(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.linkId);

    const link = await ExternalLinkService.updateExternalLink(id, {
      url: req.body.url,
      title: req.body.title,
      description: req.body.description,
    });

    if (!link) {
      return res.status(404).json({ error: 'External link not found' });
    }

    return res.status(200).json(link);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update external link' });
  }
}

export async function deleteExternalLink(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.linkId);
    const deleted = await ExternalLinkService.deleteExternalLink(id);

    if (!deleted) {
      return res.status(404).json({ error: 'External link not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete external link' });
  }
}
