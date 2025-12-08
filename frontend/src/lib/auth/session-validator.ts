import { API_BASE_URL } from '../api/client';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
  [key: string]: any;
}

/**
 * Validate session by calling backend API
 * Backend reads httpOnly cookies and validates JWT
 * 
 * NOTE: Middleware runs on server-side, so we need to forward cookies manually
 */
export async function validateSession(): Promise<SessionUser | null> {
  try {
    // Get cookies from the request (middleware context)
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

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader, // Forward cookies to backend
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (err) {
    console.error('[Session] Validation error:', err);
    return null;
  }
}
