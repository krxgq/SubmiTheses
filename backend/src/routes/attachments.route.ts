import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireProjectAccess, requireProjectModify } from '../middleware/authorization.middleware';
import {
  getProjectAttachments,
  getAttachmentById,
  deleteAttachment,
} from '../controllers/attachments.controller';
import {
  requestUploadUrl,
  confirmUpload,
  getDownloadUrl,
} from '../controllers/s3-upload.controller';
import { validate } from '../middleware/validate';
import {
  attachmentIdSchema,
  projectIdSchema,
  requestUploadUrlSchema,
  confirmUploadSchema,
} from '../validation/schemas';
import {
  destructiveActionRateLimiter,
  uploadRateLimiter,
  writeRateLimiter,
} from '../middleware/rate-limit';

const router = Router();

// Get all attachments for a project
router.get('/:id/attachments', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectAttachments);

// Get a specific attachment metadata
router.get('/:id/attachments/:attachmentId', authenticated, requireProjectAccess, validate(attachmentIdSchema), getAttachmentById);

// S3 Direct Upload Flow
// Step 1: Request pre-signed URL for upload
router.post('/:id/attachments/request-upload', authenticated, uploadRateLimiter, requireProjectModify, validate(requestUploadUrlSchema), requestUploadUrl);

// Step 2: Confirm upload after file is uploaded to S3
router.post('/:id/attachments/confirm-upload', authenticated, writeRateLimiter, requireProjectModify, validate(confirmUploadSchema), confirmUpload);

// Get pre-signed download URL for an attachment
router.get('/:id/attachments/:attachmentId/download-url', authenticated, requireProjectAccess, validate(attachmentIdSchema), getDownloadUrl);

// Delete an attachment
router.delete('/:id/attachments/:attachmentId', authenticated, destructiveActionRateLimiter, requireProjectModify, validate(attachmentIdSchema), deleteAttachment);

export default router
