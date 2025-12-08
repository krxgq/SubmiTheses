import { apiRequest, API_BASE_URL } from './client';

export const attachmentsApi = {
  getByProjectId: async (projectId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/projects/${projectId}/attachments`);
  },

  /**
   * Upload attachment with progress tracking
   * Uses XMLHttpRequest for progress events
   */
  uploadAttachment: async ({
    file,
    projectId,
    onProgress,
  }: {
    file: File;
    projectId: string;
    onProgress?: (progress: number) => void;
  }): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

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
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/attachments/upload`);
      xhr.withCredentials = true; // Send httpOnly cookies
      xhr.send(formData);
    });
  },

  upload: async (projectId: string | number, files: File[]): Promise<any> => {
    const formData = new FormData();
    // Append multiple files with the same field name 'files'
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Send httpOnly cookies
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },

  delete: async (projectId: string, attachmentId: string): Promise<void> => {
    return apiRequest<void>(`/projects/${projectId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  },
};
