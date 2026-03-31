import { S3Client } from '@aws-sdk/client-s3';

// Fail fast in production if S3 credentials are missing
const isProduction = process.env.NODE_ENV === 'production';
const useS3 = process.env.USE_S3_STORAGE === 'true';

if (isProduction && useS3) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY — required when USE_S3_STORAGE=true in production');
  }
}

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};

const requestChecksumCalculation = 'WHEN_REQUIRED' as const;
const responseChecksumValidation = 'WHEN_REQUIRED' as const;

// Internal client for server-side S3 operations (delete, exists, etc.)
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT,
  credentials,
  requestChecksumCalculation,
  responseChecksumValidation,
});

// Public client for pre-signed URLs the browser can reach
const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT;
export const s3PublicClient = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: publicEndpoint || undefined,
  forcePathStyle: !!publicEndpoint,
  credentials,
  requestChecksumCalculation,
  responseChecksumValidation,
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
