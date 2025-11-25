import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/lib/navigation'
import { matchRoute, extractParams } from './src/lib/auth/route-matcher'
import { checkRouteAccess } from './src/lib/auth/access-control'
import type { UserRole } from '@sumbi/shared-types'

// Create next-intl middleware with routing configuration
const handleI18nRouting = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Step 1: Handle i18n routing first
  // This ensures locale is properly set before any other logic
  const response = handleI18nRouting(request)

  // Step 2: Update Supabase session by passing the i18n response
  // This preserves the locale routing while adding auth cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if exists (this updates the auth cookie)
  await supabase.auth.getSession()

  // Step 3: Apply auth-based redirects only if i18n isn't already redirecting
  if (response.status !== 307 && response.status !== 308) {
    // Use getUser() for secure authentication check instead of getSession()
    const { data: { user }, error } = await supabase.auth.getUser()

    // Extract locale from pathname
    const localeMatch = pathname.match(/^\/(en|cz)(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en'

    // Handle unauthenticated users
    if (error || !user) {
      // Clear role cookie for unauthenticated users
      response.cookies.delete('user-role')

      // Allow access to auth page and public routes
      if (!pathname.includes('/auth') && !pathname.includes('/restricted')) {
        // Check if this route requires authentication
        const routeConfig = matchRoute(pathname, locale)
        if (routeConfig) {
          // Route requires auth but user not authenticated - redirect to auth
          return NextResponse.redirect(new URL(`/${locale}/auth`, request.url))
        }
      }
      return response
    }

    // Redirect authenticated users away from auth page
    if (pathname.includes('/auth')) {
      return NextResponse.redirect(new URL(`/${locale}/projects`, request.url))
    }

    // Step 4: Role-based route protection (RBAC)
    // Get role from cookie (performance optimization)
    let role = request.cookies.get('user-role')?.value as UserRole | undefined

    // If no role in cookie, fetch from database and cache it
    if (!role) {
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      role = userData?.role as UserRole | undefined

      if (role) {
        response.cookies.set('user-role', role, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60, // 1 hour
          path: '/',
        })
      }
    }

    const routeConfig = matchRoute(pathname, locale)
    if (routeConfig) {
      const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '')
      const pathParams = extractParams(pathWithoutLocale, routeConfig.pattern)

      const hasAccess = checkRouteAccess(role, routeConfig, user.id, pathParams)

      if (!hasAccess) {
        response.headers.set('x-access-denied', 'true')
        response.headers.set('x-required-roles', routeConfig.allowedRoles.join(','))
        response.headers.set('x-current-role', role || 'none')
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
