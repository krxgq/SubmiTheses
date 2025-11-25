import { supabase } from '@/lib/supabase';

/**
 * API base URL pointing directly to the backend server.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function getAccessToken(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.log('[API Browser] No authenticated user:', error?.message);
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  console.log('[API Browser] Got user:', !!user, 'Has token:', !!session?.access_token);
  return session?.access_token || null;
}

/**
 * Client-only API request (safe for Client Components)
 * Makes direct requests to backend with Supabase JWT token
 */
export async function apiRequestBrowser<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAccessToken();
  console.log('[API Browser] Making request to:', url, 'Has token:', !!token);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  console.log('[API Browser] Response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.log('[API Browser] Error response:', error);
    throw new Error(error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
