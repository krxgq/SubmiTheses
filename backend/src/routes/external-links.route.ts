import { Router } from 'express';
import { authenticated, canAccessProject, canModifyProject } from '../middleware/auth';
import {
  getProjectExternalLinks,
  getExternalLinkById,
  createExternalLink,
  updateExternalLink,
  deleteExternalLink,
} from '../controllers/external-links.controller';
import { validate } from '../middleware/validate';
import {
  createExternalLinkSchema,
  updateExternalLinkSchema,
  externalLinkIdSchema,
  projectIdSchema,
} from '../validation/schemas';

const router = Router();

// Get all external links for a project
router.get('/:id/links', authenticated, canAccessProject, validate(projectIdSchema), getProjectExternalLinks);

// Get a specific external link
router.get('/:id/links/:linkId', authenticated, canAccessProject, validate(externalLinkIdSchema), getExternalLinkById);

// Create a new external link
router.post('/:id/links', authenticated, canModifyProject, validate(createExternalLinkSchema), createExternalLink);

// Update an external link
router.put('/:id/links/:linkId', authenticated, canModifyProject, validate(updateExternalLinkSchema), updateExternalLink);

// Delete an external link
router.delete('/:id/links/:linkId', authenticated, canModifyProject, validate(externalLinkIdSchema), deleteExternalLink);

export default router;
