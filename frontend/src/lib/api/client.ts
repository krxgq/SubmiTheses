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
 * BigInt-safe JSON replacer function
 * Converts BigInt values to strings during JSON serialization
 */
const bigIntReplacer = (_key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: RequestInit['body'] | Record<string, any>;
};

/**
 * Make authenticated API request to backend
 * Uses httpOnly cookies for authentication
 * Works in both Server and Client Components by forwarding cookies appropriately
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isServer = typeof window === 'undefined';

  const { body, ...restOptions } = options || {};
  let processedBody: BodyInit | null | undefined;

  if (body) {
    // If body is not a string, stringify it with BigInt support
    if (typeof body !== 'string' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      processedBody = JSON.stringify(body, bigIntReplacer);
    } else {
      // Body is already a string, FormData, or URLSearchParams
      processedBody = body as BodyInit;
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(restOptions.headers as Record<string, string>),
  };

  // On server-side (Next.js Server Components), forward cookies manually
  if (isServer) {
    try {
      // Dynamically import cookies to avoid issues in client components
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('sb-access-token');

      console.log('[apiRequest] Server-side request to:', endpoint);
      console.log('[apiRequest] Access token exists:', !!accessToken);

      // Only forward refresh token to the refresh endpoint
      const isRefreshEndpoint = endpoint === '/auth/refresh';
      const refreshToken = isRefreshEndpoint ? cookieStore.get('sb-refresh-token') : null;

      // Build Cookie header to forward to backend
      const cookieHeader = [
        accessToken && `sb-access-token=${accessToken.value}`,
        refreshToken && `sb-refresh-token=${refreshToken.value}`,
      ]
        .filter(Boolean)
        .join('; ');

      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
        console.log('[apiRequest] Cookie header set');
      } else {
        console.log('[apiRequest] No cookies found to forward');
      }
    } catch (err) {
      console.error('[apiRequest] Failed to read cookies on server:', err);
    }
  }

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    body: processedBody,
    headers,
    credentials: isServer ? 'omit' : 'include',
    // Disable caching for server-side requests to get fresh data
    ...(isServer ? { cache: 'no-store' } : {}),
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

  const responseData = await response.json();
  return responseData;
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
