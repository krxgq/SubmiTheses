import { apiRequest, API_BASE_URL } from './client';

// S3 two-step upload flow interfaces
interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

interface ConfirmUploadRequest {
  key: string;
  filename: string;
  description?: string;
}

interface DownloadUrlResponse {
  downloadUrl: string;
  filename: string;
  expiresIn: number;
}

export interface Attachment {
  id: string;
  project_id: string;
  filename: string;
  storage_path: string;
  description: string | null;
  uploaded_at: string;
  updated_at: string;
}

/**
 * Step 1: Request pre-signed upload URL from backend
 */
export async function requestUploadUrl(
  projectId: string,
  filename: string,
  contentType: string,
  fileSize: number
): Promise<UploadUrlResponse> {
  return apiRequest<UploadUrlResponse>(`/projects/${projectId}/attachments/request-upload`, {
    method: 'POST',
    body: JSON.stringify({ filename, contentType, fileSize }),
  });
}

/**
 * Step 2: Upload file directly to S3 using pre-signed URL
 * Uses XMLHttpRequest for progress tracking
 */
export async function uploadToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('S3 upload failed'));
    });

    // PUT to S3 pre-signed URL (no credentials needed)
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Step 3: Confirm upload and save metadata to database
 */
export async function confirmUpload(
  projectId: string,
  data: ConfirmUploadRequest
): Promise<Attachment> {
  return apiRequest<Attachment>(`/projects/${projectId}/attachments/confirm-upload`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Complete upload flow: orchestrates all 3 steps
 * This is the main function components should use
 */
export async function uploadAttachment(
  projectId: string,
  file: File,
  description?: string,
  onProgress?: (progress: number) => void
): Promise<Attachment> {
  // Step 1: Request pre-signed URL
  const { uploadUrl, key } = await requestUploadUrl(
    projectId,
    file.name,
    file.type,
    file.size
  );

  // Step 2: Upload to S3
  await uploadToS3(uploadUrl, file, onProgress);

  // Step 3: Confirm upload
  return confirmUpload(projectId, {
    key,
    filename: file.name,
    description,
  });
}

/**
 * Get all attachments for a project
 */
export async function getAttachmentsByProjectId(projectId: string): Promise<Attachment[]> {
  return apiRequest<Attachment[]>(`/projects/${projectId}/attachments`);
}

/**
 * Get pre-signed download URL for an attachment
 */
export async function getDownloadUrl(
  projectId: string,
  attachmentId: string
): Promise<DownloadUrlResponse> {
  return apiRequest<DownloadUrlResponse>(
    `/projects/${projectId}/attachments/${attachmentId}/download-url`
  );
}

/**
 * Delete an attachment (removes from S3 and database)
 */
export async function deleteAttachment(
  projectId: string,
  attachmentId: string
): Promise<void> {
  return apiRequest<void>(`/projects/${projectId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
}

/**
 * Legacy wrapper for backwards compatibility with old object-based API
 * Used by ProjectHeader.tsx and other components using the old signature
 */
async function uploadAttachmentLegacy({
  file,
  projectId,
  onProgress,
}: {
  file: File;
  projectId: string;
  onProgress?: (progress: number) => void;
}): Promise<Attachment> {
  return uploadAttachment(projectId, file, undefined, onProgress);
}

// Legacy export for backwards compatibility
export const attachmentsApi = {
  getByProjectId: getAttachmentsByProjectId,
  upload: uploadAttachment, // New S3 flow with positional params
  uploadAttachment: uploadAttachmentLegacy, // Legacy object-based signature
  getDownloadUrl,
  delete: deleteAttachment,
};
