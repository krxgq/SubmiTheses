import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/navigation";
import { matchRoute, extractParams } from "./lib/auth/route-matcher";
import { checkRouteAccess } from "./lib/auth/access-control";
import { validateSession } from "./lib/auth/session-validator";
import type { UserRole } from "@sumbi/shared-types";

/**
 * Next.js Middleware - Route Protection & Session Validation
 *
 * NO Supabase - validates session via backend API
 */

// Create next-intl middleware with routing configuration
const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Step 1: Handle i18n routing first
  const response = handleI18nRouting(request);

  // Step 2: Validate session via backend API
  if (response.status !== 307 && response.status !== 308) {
    // Extract locale from pathname
    const localeMatch = pathname.match(/^\/(en|cz)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    // Validate session using backend API
    const user = await validateSession();

    // Not logged in - redirect to auth page (except if already on auth page)
    if (!user && !pathname.includes("/auth")) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }

    // Logged in but on auth page - redirect to projects
    if (user && pathname.includes("/auth")) {
      return NextResponse.redirect(new URL(`/${locale}/projects`, request.url));
    }

    // Route protection for authenticated users
    if (user) {
      // Get role from user object (returned by backend)
      const userRole: UserRole = (user.role as UserRole) || 'student';

      // Step 3: Route protection logic
      const routeConfig = matchRoute(pathname, locale);

      if (routeConfig) {
        const pathParams = extractParams(pathname.replace(new RegExp(`^/${locale}`), ''), routeConfig.pattern);
        const hasAccess = checkRouteAccess(userRole, routeConfig, user.id, pathParams);

        if (!hasAccess) {
          console.log('[Middleware] Access denied, rewriting to access-denied page');

          // Rewrite to access-denied page (preserves URL in browser, stops original page execution)
          const accessDeniedUrl = new URL(`/${locale}/access-denied`, request.url);
          const newResponse = NextResponse.rewrite(accessDeniedUrl);

          newResponse.headers.set('x-access-denied', 'true');
          newResponse.headers.set('x-required-roles', routeConfig.allowedRoles.join(','));
          newResponse.headers.set('x-current-role', userRole);
          newResponse.headers.set('x-route-pattern', routeConfig.pattern);

          // Prevent caching to ensure fresh checks on navigation
          newResponse.headers.set('Cache-Control', 'no-store, must-revalidate');

          return newResponse;
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
