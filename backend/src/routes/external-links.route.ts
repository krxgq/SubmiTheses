import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireProjectAccess, requireProjectModify } from '../middleware/authorization.middleware';
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
router.get('/:id/links', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectExternalLinks);

// Get a specific external link
router.get('/:id/links/:linkId', authenticated, requireProjectAccess, validate(externalLinkIdSchema), getExternalLinkById);

// Create a new external link
router.post('/:id/links', authenticated, requireProjectModify, validate(createExternalLinkSchema), createExternalLink);

// Update an external link
router.put('/:id/links/:linkId', authenticated, requireProjectModify, validate(updateExternalLinkSchema), updateExternalLink);

// Delete an external link
router.delete('/:id/links/:linkId', authenticated, requireProjectModify, validate(externalLinkIdSchema), deleteExternalLink);

export default router;
