'use server'

import { cookies } from 'next/headers'

/**
 * Clears the user-role cookie.
 *
 * Call this function when a user's role is updated to ensure
 * the cached role is refreshed on the next request.
 *
 * This should be called:
 * - After updating a user's role in the database
 * - After user logout
 * - When role changes need to take effect immediately
 *
 * @example
 * // After updating user role
 * await usersApi.updateRole(userId, newRole)
 * await clearRoleCookie()
 */
export async function clearRoleCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('user-role')
}
