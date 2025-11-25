import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

/**
 * Centralized routing configuration for next-intl
 * This defines available locales and the default locale for the application
 *
 * localePrefix: 'always' ensures all routes have a locale prefix (e.g., /en/projects)
 * This prevents issues by enforcing locale in all URLs
 */
export const routing = defineRouting({
  locales: ['en', 'cz'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

/**
 * Locale-aware navigation utilities from next-intl
 * These automatically handle locale prefixes in navigation
 *
 * Usage:
 * - Link: Use instead of Next.js Link for locale-aware navigation
 * - useRouter: Client-side programmatic navigation with locale handling
 * - usePathname: Get current pathname without locale prefix
 * - redirect: Server-side redirect with locale handling
 *
 * Example redirect usage in Server Component:
 *   import { redirect } from '@/lib/navigation';
 *   import { getLocale } from 'next-intl/server';
 *
 *   const locale = await getLocale();
 *   redirect({href: '/projects', locale});
 */
export const { Link, usePathname, useRouter, redirect } = createNavigation(routing);
