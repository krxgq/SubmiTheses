import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import { LockKeyhole } from 'lucide-react'
import { Button } from 'flowbite-react'
import { BackButton } from './BackButton'

/**
 * Access Denied Component
 *
 * Displays an access denied message when user doesn't have permission
 * for the current route. Can be shown inline instead of redirecting.
 *
 * @param requiredRoles - Optional list of roles required for access
 * @param currentRole - Optional current user role
 */
export function AccessDenied({
  requiredRoles,
  currentRole,
}: {
  requiredRoles?: string[]
  currentRole?: string
}) {
  const t = useTranslations()

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background p-4">
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

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (requiredRoles || currentRole) && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentRole && (
                <span className="block">
                  Your role: <code className="text-xs font-mono">{currentRole}</code>
                </span>
              )}
              {requiredRoles && (
                <span className="block">
                  Required: <code className="text-xs font-mono">{requiredRoles.join(', ')}</code>
                </span>
              )}
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
