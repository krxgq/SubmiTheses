import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireProjectAccess, requireProjectModify } from '../middleware/authorization.middleware';
import {
  getProjectAttachments,
  getAttachmentById,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
} from '../controllers/attachments.controller';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { attachmentIdSchema, projectIdSchema } from '../validation/schemas';

const router = Router();

// Get all attachments for a project
router.get('/:id/attachments', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectAttachments);

// Get a specific attachment metadata
router.get('/:id/attachments/:attachmentId', authenticated, requireProjectAccess, validate(attachmentIdSchema), getAttachmentById);

// Upload new attachments (supports multiple files)
router.post('/:id/attachments', authenticated, requireProjectModify, validate(projectIdSchema), upload.array('files', 10), uploadAttachment);

// Download an attachment
router.get('/:id/attachments/:attachmentId/download', authenticated, requireProjectAccess, validate(attachmentIdSchema), downloadAttachment);

// Delete an attachment
router.delete('/:id/attachments/:attachmentId', authenticated, requireProjectModify, validate(attachmentIdSchema), deleteAttachment);

export default router
