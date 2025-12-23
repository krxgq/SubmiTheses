/**
 * API base URL pointing directly to the backend server.
 * Frontend makes direct requests to backend.
 * Authentication handled via httpOnly cookies set by backend.
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
 * Make authenticated API request to backend
 * Uses httpOnly cookies for authentication
 * Works in both Server and Client Components by forwarding cookies appropriately
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isServer = typeof window === 'undefined';

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as Record<string, string>,
  };

  // On server-side (Next.js Server Components), forward cookies manually
  if (isServer) {
    try {
      // Dynamically import cookies to avoid issues in client components
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('sb-access-token');
      const refreshToken = cookieStore.get('sb-refresh-token');

      // Build Cookie header to forward to backend
      const cookieHeader = [
        accessToken && `sb-access-token=${accessToken.value}`,
        refreshToken && `sb-refresh-token=${refreshToken.value}`,
      ]
        .filter(Boolean)
        .join('; ');

      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }
    } catch (err) {
      console.error('[apiRequest] Failed to read cookies on server:', err);
    }
  }

  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: isServer ? 'omit' : 'include',
    // Add caching for server-side GET requests
    ...(isServer && (!options?.method || options.method === 'GET') && !options?.cache
      ? { next: { revalidate: 10 } } // Cache for 10 seconds on server
      : {}),
  });

  // Handle errors - throw ApiError with status code for proper error handling
  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
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
