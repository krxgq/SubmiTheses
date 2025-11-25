import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/navigation'
import { BackButton } from '@/components/auth/BackButton'
import { LockKeyhole } from 'lucide-react'
import { Button } from 'flowbite-react'

/**
 * Restricted Access Page
 *
 * Displayed when a user tries to access a route they don't have permission for.
 * Middleware redirects unauthorized users here with the original URL in query params.
 *
 * Features:
 * - Clear explanation of why access was denied
 * - Back button to return to previous page
 * - Link to dashboard/projects page
 * - Prevents search engine indexing (SEO metadata)
 */
export default async function RestrictedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { locale } = await params
  const { from } = await searchParams
  const t = await getTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
            <LockKeyhole className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('access.restricted.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('access.restricted.message')}
          </p>
        </div>

        {/* Attempted URL (optional debug info) */}
        {from && process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Attempted to access: <code className="text-xs">{from}</code>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BackButton label={t('access.restricted.goBack')} />

          <Link href="/projects">
            <Button color="blue">
              {t('access.restricted.goHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * SEO Metadata
 *
 * Prevents search engines from indexing this page.
 * Restricted pages should not appear in search results.
 */
export const metadata = {
  robots: 'noindex, nofollow',
  title: 'Access Restricted',
}
