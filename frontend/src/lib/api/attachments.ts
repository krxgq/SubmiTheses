import { supabase } from '../supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function getClientToken(): Promise<string | null> {
  // Use getUser() for secure authentication validation instead of getSession()
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get session for access token after validating user
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export const attachmentsApi = {
  getByProjectId: async (projectId: string): Promise<any[]> => {
    const token = await getClientToken();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new ApiError(await response.text(), response.status);
    }

    return response.json();
  },

  upload: async (projectId: string | number, files: File[]): Promise<any> => {
    const formData = new FormData();
    // Append multiple files with the same field name 'files'
    files.forEach(file => {
      formData.append('files', file);
    });

    const token = await getClientToken();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(await response.text(), response.status);
    }

    return response.json();
  },

  delete: async (projectId: string, attachmentId: string): Promise<void> => {
    const token = await getClientToken();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new ApiError(await response.text(), response.status);
    }
  },
}
