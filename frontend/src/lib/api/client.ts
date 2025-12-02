/**
 * API base URL pointing directly to the backend server.
 * Frontend makes direct requests to backend with Supabase JWT tokens.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Get access token from Supabase user
 * Works in both server and client contexts
 * Uses getUser() for secure authentication validation
 */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    // Server-side: use require-role pattern
    try {
      const { createClient } = await import('@/lib/supabase-server');
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.log('[API] Server - No authenticated user:', error?.message);
        return null;
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log('[API] Server - Got user:', !!user, 'Has token:', !!session?.access_token);
      return session?.access_token || null;
    } catch (error) {
      console.error('[API] Server auth error:', error);
      return null;
    }
  } else {
    // Client-side: use browser Supabase client
    const { supabase } = await import('@/lib/supabase');
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('[API] Client - No authenticated user:', error?.message);
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    console.log('[API] Client - Got user:', !!user, 'Has token:', !!session?.access_token);
    return session?.access_token || null;
  }
}

/**
 * Make authenticated API request to backend
 * Gets Supabase JWT token and sends to backend for validation
 * Works in both Server and Client Components
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get access token from Supabase session
  const token = await getAccessToken();
  console.log('[API] Making request to:', url, 'Has token:', !!token);

  // Make request with Supabase JWT token
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  console.log('[API] Response status:', response.status, response.statusText);

  // Handle errors - throw ApiError with status code for proper error handling
  if (!response.ok) {
    const errorText = await response.text();
    console.log('[API] Error response:', response.status, errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }

    // Handle stale token - force page reload to get fresh session
    if (errorData.code === 'TOKEN_STALE' && typeof window !== 'undefined') {
      console.log('[API] Token stale - reloading page for fresh session');
      window.location.reload();
      // Wait forever, page is reloading
      await new Promise(() => {});
    }

    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  handleError(error: any): never {
    throw new ApiError(
      error.message || "An error occurred",
      error.code,
      error.details,
    );
  },
};
