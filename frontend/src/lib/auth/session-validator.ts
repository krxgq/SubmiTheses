import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { UserRole } from '@sumbi/shared-types';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  [key: string]: any;
}

// JWT secret for local verification (must match backend)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET
);

const JWT_ISSUER = process.env.JWT_ISSUER || 'sumbi-theses';

/**
 * Validate session by verifying JWT locally (NO backend API call)
 *
 * OPTIMIZED: Verifies JWT signature locally using jose library
 * - 100x faster than calling backend API (10-50ms vs 4000ms)
 * - Same verification as middleware, but can be called from server components
 * - No network overhead, pure CPU verification
 *
 * Migration-ready: Works with custom JWTs, not Supabase
 */
export async function validateSession(): Promise<SessionUser | null> {
  try {
    // Get access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token');

    // No token = no session
    if (!accessToken) {
      return null;
    }

    // ✅ Verify JWT signature locally (no backend call!)
    const { payload } = await jwtVerify(accessToken.value, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });

    // Extract user data from JWT payload
    const user: SessionUser = {
      id: payload.sub!,
      email: payload.email as string,
      role: payload.role as UserRole,
    };

    return user;
  } catch (err) {
    // JWT verification failed (expired, invalid signature, etc.)
    console.error('[Session] JWT verification failed:', err);
    return null;
  }
}
