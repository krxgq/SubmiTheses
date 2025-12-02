import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/navigation";
import { createClient } from "./lib/supabase-server";
import { matchRoute, extractParams } from "./lib/auth/route-matcher";
import { checkRouteAccess } from "./lib/auth/access-control";
import { extractRoleFromToken, isTokenStale } from "./lib/auth/jwt-utils";
import type { UserRole } from "@sumbi/shared-types";

// Create next-intl middleware with routing configuration
const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Step 1: Handle i18n routing first
  const response = handleI18nRouting(request);

  // Step 2: Update Supabase session
  const supabase = await createClient();

  // Step 3: Auth check with role from JWT
  if (response.status !== 307 && response.status !== 308) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Extract locale from pathname
    const localeMatch = pathname.match(/^\/(en|cz)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    // Not logged in - redirect to auth page (except if already on auth page)
    if ((error || !user) && !pathname.includes("/auth")) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }

    // Logged in but on auth page - redirect to projects
    if (user && pathname.includes("/auth")) {
      return NextResponse.redirect(new URL(`/${locale}/projects`, request.url));
    }

    // Extract role from JWT token for authenticated users
    if (user) {
      let userRole: UserRole = 'student'; 

      try {
        // Get session to access JWT token
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (accessToken) {
          // Extract role using centralized utility
          userRole = extractRoleFromToken(accessToken);

          // Check if token needs refresh (stale after 30 minutes)
          if (isTokenStale(accessToken, 30)) {
            console.log('[Middleware] Token is stale, refreshing session...');
            const { data: refreshResult, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.log('[Middleware] Session refresh failed, redirecting to auth');
              return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
            }

            if (refreshResult.session?.access_token) {
              // Get updated role from fresh token using utility
              userRole = extractRoleFromToken(refreshResult.session.access_token);
              console.log('[Middleware] Session refreshed, updated role:', userRole);
            }
          }
        }
      } catch (e) {
        console.warn('[Middleware] Could not extract role from JWT:', e);
      }
      
      // Step 4: Route protection logic
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
