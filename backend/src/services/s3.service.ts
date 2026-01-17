import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_CONFIG } from '../config/s3.config';
import path from 'path';

type BucketType = 'attachments' | 'avatars';

export class S3Service {
  /**
   * Generate pre-signed URL for uploading an attachment
   */
  static async generateAttachmentUploadUrl(
    projectId: bigint,
    filename: string,
    contentType: string,
    fileSize: number
  ): Promise<{ uploadUrl: string; key: string }> {
    // Validate file type
    if (!S3_CONFIG.allowedAttachmentTypes.includes(contentType)) {
      throw new Error(`File type ${contentType} is not allowed for attachments`);
    }

    // Validate file size
    if (fileSize > S3_CONFIG.maxAttachmentSize) {
      throw new Error(`File size exceeds maximum allowed size of ${S3_CONFIG.maxAttachmentSize} bytes`);
    }

    // Generate unique key: projects/{projectId}/{timestamp}-{filename}
    const timestamp = Date.now();
    const sanitizedFilename = path.basename(filename);
    const key = `projects/${projectId}/${timestamp}-${sanitizedFilename}`;

    // Create command for PUT operation
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.buckets.attachments,
      Key: key,
      ContentType: contentType,
      Metadata: {
        projectId: String(projectId),
        originalFilename: sanitizedFilename,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate pre-signed URL (expires in 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: S3_CONFIG.uploadUrlExpiration,
    });

    return { uploadUrl, key };
  }

  /**
   * Generate pre-signed URL for uploading an avatar
   */
  static async generateAvatarUploadUrl(
    userId: string,
    filename: string,
    contentType: string,
    fileSize: number
  ): Promise<{ uploadUrl: string; key: string }> {
    // Validate file type
    if (!S3_CONFIG.allowedAvatarTypes.includes(contentType)) {
      throw new Error(`File type ${contentType} is not allowed for avatars`);
    }

    // Validate file size
    if (fileSize > S3_CONFIG.maxAvatarSize) {
      throw new Error(`File size exceeds maximum allowed size of ${S3_CONFIG.maxAvatarSize} bytes`);
    }

    // Generate unique key: avatars/{userId}/{timestamp}-{filename}
    const timestamp = Date.now();
    const sanitizedFilename = path.basename(filename);
    const key = `avatars/${userId}/${timestamp}-${sanitizedFilename}`;

    // Create command for PUT operation
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.buckets.avatars,
      Key: key,
      ContentType: contentType,
      Metadata: {
        userId: userId,
        originalFilename: sanitizedFilename,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate pre-signed URL (expires in 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: S3_CONFIG.uploadUrlExpiration,
    });

    return { uploadUrl, key };
  }

  /**
   * Generate pre-signed URL for downloading a file
   * Automatically determines bucket based on key prefix
   */
  static async generateDownloadUrl(key: string): Promise<string> {
    const bucket = this.getBucketFromKey(key);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    // Generate pre-signed URL (expires in 1 hour)
    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: S3_CONFIG.downloadUrlExpiration,
    });

    return downloadUrl;
  }

  /**
   * Delete a file from S3
   * Automatically determines bucket based on key prefix
   */
  static async deleteFile(key: string): Promise<void> {
    const bucket = this.getBucketFromKey(key);

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Validate if a file exists in S3
   */
  static async fileExists(key: string): Promise<boolean> {
    try {
      const bucket = this.getBucketFromKey(key);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Helper: Determine bucket from S3 key prefix
   */
  private static getBucketFromKey(key: string): string {
    if (key.startsWith('avatars/')) {
      return S3_CONFIG.buckets.avatars;
    } else if (key.startsWith('projects/')) {
      return S3_CONFIG.buckets.attachments;
    } else {
      // Default to attachments bucket for backward compatibility
      return S3_CONFIG.buckets.attachments;
    }
  }
}
