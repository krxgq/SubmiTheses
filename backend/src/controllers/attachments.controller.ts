import { Request, Response } from 'express';
import { AttachmentService } from '../services/attachments.service';
import { ActivityLogService } from '../services/activity-logs.service';
import { S3Service } from '../services/s3.service';
import validator from 'validator';

/**
 * Get all attachments for a project
 */
export async function getProjectAttachments(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const attachments = await AttachmentService.getAttachmentsByProjectId(projectId);
    return res.status(200).json(attachments);
  } catch (error) {
    console.error('[Attachments] Fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch attachments' });
  }
}

/**
 * Get a specific attachment's metadata
 */
export async function getAttachmentById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.attachmentId);
    const attachment = await AttachmentService.getAttachmentById(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    return res.status(200).json(attachment);
  } catch (error) {
    console.error('[Attachments] Fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch attachment' });
  }
}

/**
 * Delete an attachment (S3 + database)
 */
export async function deleteAttachment(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.attachmentId);

    // Get attachment metadata
    const attachment = await AttachmentService.getAttachmentById(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete from S3
    await S3Service.deleteFile(attachment.storage_path);

    // Delete from database
    await AttachmentService.deleteAttachment(id);

    // Log file deletion activity
    if (attachment.project_id) {
      await ActivityLogService.logActivity(
        BigInt(attachment.project_id),
        req.user!.id,
        'file_deleted',
        `File deleted: ${validator.escape(attachment.filename)}`
      );
    }

    return res.status(204).send();
  } catch (error) {
    console.error('[Attachments] Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete attachment' });
  }
}
