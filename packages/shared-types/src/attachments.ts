// Re-export Prisma types
export type { attachments as Attachment } from '@prisma/client';

// API Request types (attachments are typically handled via file uploads, but we can define metadata types)
export interface CreateAttachmentRequest {
  filename: string;
  storage_path: string;
  description?: string;
}

export interface UpdateAttachmentRequest {
  description?: string;
}
