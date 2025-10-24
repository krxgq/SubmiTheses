import { Request, Response } from 'express';
import { AttachmentService } from '../services/attachments.service';
import { deleteFile } from '../middleware/upload';
import path from 'path';

export async function getProjectAttachments(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const attachments = await AttachmentService.getAttachmentsByProjectId(projectId);
    return res.status(200).json(attachments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch attachments' });
  }
}

export async function getAttachmentById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.attachmentId);
    const attachment = await AttachmentService.getAttachmentById(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    return res.status(200).json(attachment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch attachment' });
  }
}

export async function uploadAttachment(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const projectId = BigInt(req.params.id);

    const attachment = await AttachmentService.createAttachment({
      project_id: projectId,
      storage_path: req.file.path,
      filename: req.file.originalname,
      description: req.body.description,
    });

    return res.status(201).json(attachment);
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    return res.status(500).json({ error: 'Failed to upload attachment' });
  }
}

export async function downloadAttachment(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.attachmentId);
    const attachment = await AttachmentService.getAttachmentById(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Send file
    return res.download(attachment.storage_path, attachment.filename);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to download attachment' });
  }
}

export async function deleteAttachment(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.attachmentId);
    const attachment = await AttachmentService.deleteAttachment(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from filesystem
    deleteFile(attachment.storage_path);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete attachment' });
  }
}
