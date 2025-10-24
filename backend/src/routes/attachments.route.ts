import { Router } from 'express';
import { authenticated, canAccessProject, canModifyProject } from '../middleware/auth';
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
router.get('/:id/attachments', authenticated, canAccessProject, validate(projectIdSchema), getProjectAttachments);

// Get a specific attachment metadata
router.get('/:id/attachments/:attachmentId', authenticated, canAccessProject, validate(attachmentIdSchema), getAttachmentById);

// Upload a new attachment
router.post('/:id/attachments', authenticated, canModifyProject, validate(projectIdSchema), upload.single('file'), uploadAttachment);

// Download an attachment
router.get('/:id/attachments/:attachmentId/download', authenticated, canAccessProject, validate(attachmentIdSchema), downloadAttachment);

// Delete an attachment
router.delete('/:id/attachments/:attachmentId', authenticated, canModifyProject, validate(attachmentIdSchema), deleteAttachment);

export default router;