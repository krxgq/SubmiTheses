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
    // Handle multiple file uploads
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const projectId = BigInt(req.params.id);
    const uploadedAttachments = [];

    // Create attachment records for all uploaded files
    for (const file of files) {
      try {
        const upload = await AttachmentService.uploadAttachment(file, projectId);
        if (!upload.success) {
          // Clean up this file if upload failed
          deleteFile(file.path);
          return res.status(500).json({ error: `Failed to upload file: ${file.originalname}` });
        }

        const attachment = await AttachmentService.createAttachment({
          project_id: projectId,
          storage_path: file.path,
          filename: file.originalname,
          description: req.body.description || null,
        });
        uploadedAttachments.push(attachment);
      } catch (error) {
        // Clean up this file if database operation fails
        deleteFile(file.path);
        throw error;
      }
    }

    return res.status(201).json(uploadedAttachments);
  } catch (error) {
    // Clean up all uploaded files if any operation fails
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => deleteFile(file.path));
    }
    return res.status(500).json({ error: 'Failed to upload attachments' });
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
