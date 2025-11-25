import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import type { UserRole } from '@sumbi/shared-types'
import { AccessDenied } from '@/components/auth/AccessDenied'

/**
 * Server-side helper to check if user has access to a page.
 *
 * Returns an object with:
 * - authorized: boolean indicating if user has access
 * - role: current user role
 * - userId: current user ID
 * - component: AccessDenied component to render if unauthorized
 *
 * Usage in page.tsx:
 * ```tsx
 * const access = await checkPageAccess(['admin'])
 * if (!access.authorized) {
 *   return access.component
 * }
 * // Continue with page rendering...
 * ```
 */
export async function checkPageAccess(
  allowedRoles: UserRole[],
  options?: {
    checkOwnership?: boolean
    resourceUserId?: string
  }
): Promise<{
  authorized: boolean
  role?: UserRole
  userId?: string
  component: React.ReactNode
}> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      authorized: false,
      component: <AccessDenied requiredRoles={allowedRoles} />,
    }
  }

  // Get role from cookie (same as middleware)
  const cookieStore = await cookies()
  let role = cookieStore.get('user-role')?.value as UserRole | undefined

  // If no role in cookie, fetch from database
  if (!role) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    role = userData?.role as UserRole | undefined
  }

  // Check if user has required role
  if (!role || !allowedRoles.includes(role)) {
    return {
      authorized: false,
      role,
      userId: user.id,
      component: <AccessDenied requiredRoles={allowedRoles} currentRole={role} />,
    }
  }

  // Check ownership if required
  if (options?.checkOwnership && options?.resourceUserId) {
    // Admin and teacher bypass ownership checks
    if (role !== 'admin' && role !== 'teacher') {
      if (options.resourceUserId !== user.id) {
        return {
          authorized: false,
          role,
          userId: user.id,
          component: <AccessDenied requiredRoles={allowedRoles} currentRole={role} />,
        }
      }
    }
  }

  return {
    authorized: true,
    role,
    userId: user.id,
    component: null,
  }
}
