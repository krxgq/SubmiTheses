import { S3Client } from '@aws-sdk/client-s3';

// Initialize S3 client with credentials from environment
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 bucket configuration
export const S3_CONFIG = {
  buckets: {
    attachments: process.env.AWS_S3_BUCKET_ATTACHMENTS || 'sumbitheses-attachments',
    avatars: process.env.AWS_S3_BUCKET_AVATARS || 'sumbitheses-avatars',
  },
  region: process.env.AWS_REGION || 'us-east-1',
  // Allowed file types for attachments
  allowedAttachmentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
  ],
  // Allowed file types for avatars
  allowedAvatarTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  // Maximum file sizes
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB for attachments
  maxAvatarSize: 2 * 1024 * 1024, // 2MB for avatars
  // Pre-signed URL expiration times
  uploadUrlExpiration: 300, // 5 minutes
  downloadUrlExpiration: 3600, // 1 hour
};
