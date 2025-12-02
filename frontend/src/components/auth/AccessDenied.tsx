import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import { LockKeyhole } from 'lucide-react'
import { Button } from 'flowbite-react'
import { BackButton } from './BackButton'

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
          <div className="rounded-full bg-background-tertiary p-6 shadow-lg">
            <LockKeyhole className="h-16 w-16 text-accent-danger" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('access.restricted.title')}
          </h1>
          <p className="text-secondary">
            {t('access.restricted.message')}
          </p>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (requiredRoles || currentRole) && (
          <div className="bg-background-elevated border border-subtle rounded-lg p-4 text-left shadow-sm">
            <h3 className="text-sm font-medium text-primary mb-2">
              Debug Information:
            </h3>
            <div className="space-y-1">
              {currentRole && (
                <p className="text-sm text-secondary">
                  Your role: <code className="text-xs font-mono bg-background-tertiary px-1 py-0.5 rounded text-primary">{currentRole}</code>
                </p>
              )}
              {requiredRoles && (
                <p className="text-sm text-secondary">
                  Required: <code className="text-xs font-mono bg-background-tertiary px-1 py-0.5 rounded text-accent-danger">{requiredRoles.join(', ')}</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BackButton label={t('access.restricted.goBack')} />

          <Link href="/projects">
            <Button 
              color="blue"
              className="bg-interactive-primary hover:bg-interactive-primary-hover text-text-inverse border-none"
            >
              {t('access.restricted.goHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
