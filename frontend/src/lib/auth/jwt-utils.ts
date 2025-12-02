import type { UserRole } from '@sumbi/shared-types';

interface JWTPayload {
  sub: string; // User ID
  email: string;
  app_metadata?: {
    role?: UserRole;
  };
  user_metadata?: {
    role?: UserRole;
  };
  iat: number; 
  exp: number; 
  aud?: string;
  iss?: string;
}

/**
 * Extract role from JWT access token
 *
 * Priority: app_metadata.role > user_metadata.role > 'student' (fallback)
 *
 * @param accessToken - The JWT access token from Supabase
 * @returns UserRole - The user's role from the token
 */
export function extractRoleFromToken(accessToken: string): UserRole {
  try {
    // Decode JWT payload (base64 decode the middle part)
    const payload: JWTPayload = JSON.parse(atob(accessToken.split('.')[1]));

    const role = payload.app_metadata?.role || payload.user_metadata?.role || 'student';

    return role;
  } catch (error) {
    console.warn('[JWT] Failed to extract role from token:', error);
    return 'student';
  }
}

/**
 * Check if token is stale and needs refresh
 *
 * @param accessToken - The JWT access token
 * @param maxAgeMinutes - Maximum age in minutes before considering token stale (default: 30)
 * @returns boolean - true if token is older than maxAgeMinutes
 */
export function isTokenStale(
  accessToken: string,
  maxAgeMinutes: number = 30
): boolean {
  try {
    const payload: JWTPayload = JSON.parse(atob(accessToken.split('.')[1]));

    // Calculate token age
    const tokenAge = Date.now() - (payload.iat * 1000);
    const maxAge = maxAgeMinutes * 60 * 1000;

    return tokenAge > maxAge;
  } catch (error) {
    console.warn('[JWT] Failed to check token staleness:', error);
    // If we can't parse, treat as stale (trigger refresh)
    return true;
  }
}

/**
 * Extract user ID from JWT token
 *
 * @param accessToken - The JWT access token
 * @returns string | null - The user ID (sub claim) or null if extraction fails
 */
export function extractUserIdFromToken(accessToken: string): string | null {
  try {
    const payload: JWTPayload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.sub;
  } catch (error) {
    console.warn('[JWT] Failed to extract user ID from token:', error);
    return null;
  }
}

/**
 * Extract email from JWT token
 *
 * @param accessToken - The JWT access token
 * @returns string | null - The user email or null if extraction fails
 */
export function extractEmailFromToken(accessToken: string): string | null {
  try {
    const payload: JWTPayload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.email;
  } catch (error) {
    console.warn('[JWT] Failed to extract email from token:', error);
    return null;
  }
}

/**
 * Decode entire JWT payload
 *
 * Useful for debugging or accessing less common claims
 *
 * @param accessToken - The JWT access token
 * @returns JWTPayload | null - The decoded payload or null if parsing fails
 */
export function decodeToken(accessToken: string): JWTPayload | null {
  try {
    return JSON.parse(atob(accessToken.split('.')[1]));
  } catch (error) {
    console.warn('[JWT] Failed to decode token:', error);
    return null;
  }
}
