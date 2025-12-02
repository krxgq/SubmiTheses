import { setRequestLocale } from 'next-intl/server';

interface AccessDeniedPageProps {
  params: Promise<{ locale: string }>;
}

// Force dynamic rendering - access control is per-request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Access Denied Page
 *
 * This page is the destination for middleware rewrites when access is denied.
 * It returns null because the layout already handles rendering the AccessDenied
 * component by reading the x-access-denied header.
 *
 * Why inside (dashboard) layout:
 * - Reuses sidebar, header, breadcrumbs
 * - Maintains consistent authenticated UI
 * - No need to duplicate layout code
 */
export default async function AccessDeniedPage({ params }: AccessDeniedPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Return null - layout will read x-access-denied header and show AccessDenied component
  return null;
}
