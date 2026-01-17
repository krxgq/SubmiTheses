import { Request, Response } from 'express';
import { S3Service } from '../services/s3.service';
import { AttachmentService } from '../services/attachments.service';
import { ActivityLogService } from '../services/activity-logs.service';
import validator from 'validator';

/**
 * Request a pre-signed URL for uploading to S3
 * Step 1: Frontend requests permission to upload
 */
export async function requestUploadUrl(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const { filename, contentType, fileSize } = req.body;

    // Validate inputs
    if (!filename || !contentType || !fileSize) {
      return res.status(400).json({
        error: 'Missing required fields: filename, contentType, fileSize'
      });
    }

    // Validate filename - prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        error: 'Invalid filename: path traversal not allowed'
      });
    }

    // Generate pre-signed URL for attachment upload
    const { uploadUrl, key } = await S3Service.generateAttachmentUploadUrl(
      projectId,
      filename,
      contentType,
      fileSize
    );

    return res.status(200).json({
      uploadUrl,
      key,
      expiresIn: 300, // 5 minutes
    });
  } catch (error: any) {
    console.error('[S3Upload] Error generating upload URL:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate upload URL'
    });
  }
}

/**
 * Confirm file upload and save metadata
 * Step 2: After frontend uploads to S3, confirm and save metadata
 */
export async function confirmUpload(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const { key, filename, description } = req.body;

    // Validate inputs
    if (!key || !filename) {
      return res.status(400).json({
        error: 'Missing required fields: key, filename'
      });
    }

    // Optional: Verify file exists in S3
    const exists = await S3Service.fileExists(key);
    if (!exists) {
      return res.status(404).json({
        error: 'File not found in storage. Upload may have failed.'
      });
    }

    // Save attachment metadata to database
    const attachment = await AttachmentService.createAttachment({
      project_id: projectId,
      storage_path: key, // S3 key instead of local path
      filename: filename,
      description: description || null,
    });

    // Log activity
    await ActivityLogService.logActivity(
      projectId,
      req.user!.id,
      'file_uploaded',
      `File uploaded: ${validator.escape(filename)}`
    );

    return res.status(201).json(attachment);
  } catch (error: any) {
    console.error('[S3Upload] Error confirming upload:', error);
    return res.status(500).json({
      error: 'Failed to confirm upload'
    });
  }
}

/**
 * Get download URL for an attachment
 * Generates pre-signed URL for downloading from S3
 */
export async function getDownloadUrl(req: Request, res: Response) {
  try {
    const attachmentId = BigInt(req.params.attachmentId);

    // Get attachment metadata
    const attachment = await AttachmentService.getAttachmentById(attachmentId);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Generate download URL
    const downloadUrl = await S3Service.generateDownloadUrl(attachment.storage_path);

    return res.status(200).json({
      downloadUrl,
      filename: attachment.filename,
      expiresIn: 3600, // 1 hour
    });
  } catch (error: any) {
    console.error('[S3Upload] Error generating download URL:', error);
    return res.status(500).json({
      error: 'Failed to generate download URL'
    });
  }
}
