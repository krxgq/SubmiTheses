import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/navigation";
import { matchRoute, extractParams } from "./lib/auth/route-matcher";
import { checkRouteAccess } from "./lib/auth/access-control";
import { jwtVerify } from "jose";
import type { UserRole } from "@sumbi/shared-types";

/**
 * Next.js Middleware - Route Protection & Session Validation
 *
 * OPTIMIZED: Verifies custom JWT signature locally (no Supabase!)
 * - Validates JWT signature using our own JWT secret
 * - Extracts role directly from JWT payload
 * - Migration-ready: Works with any PostgreSQL database
 * - ~4 seconds → ~10-50ms per request
 */

// Create next-intl middleware with routing configuration
const handleI18nRouting = createMiddleware(routing);

// JWT secret for signature verification
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET
);

if (!JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not configured. Please check your .env file and next.config.ts');
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Step 1: Handle i18n routing first
  const response = handleI18nRouting(request);

  // Step 2: Validate session using JWT signature verification
  if (response.status !== 307 && response.status !== 308) {
    // Extract locale from pathname
    const localeMatch = pathname.match(/^\/(en|cz)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken && !pathname.includes("/auth")) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }

    if (accessToken && pathname.includes("/auth")) {
      return NextResponse.redirect(new URL(`/${locale}/projects`, request.url));
    }

    // Route protection for authenticated users
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET, {
          issuer: process.env.JWT_ISSUER || 'sumbi-theses',
        });

        // Extract role directly from JWT payload (our custom format)
        const userRole: UserRole = (payload.role as UserRole) || 'student';
        const userId = payload.sub;

        if (!userId) {
          return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
        }

        // Step 3: Route protection logic
        const routeConfig = matchRoute(pathname, locale);

        if (routeConfig) {
          const pathParams = extractParams(pathname.replace(new RegExp(`^/${locale}`), ''), routeConfig.pattern);
          const hasAccess = checkRouteAccess(userRole, routeConfig, userId, pathParams);

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

        // Set user role header for all authenticated requests so sidebar can display correctly
        const newResponse = NextResponse.next();
        newResponse.headers.set('x-current-role', userRole);
        return newResponse;
      } catch (error) {
        // JWT verification failed (expired, invalid signature, etc.)
        console.log('[Middleware] JWT verification failed:', error);
        return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|clear-cookies).*)"
  ],
};
