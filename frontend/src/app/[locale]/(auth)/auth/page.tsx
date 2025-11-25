import AuthPageClient from './AuthPageClient'
import { authService } from '@/lib/auth'
import { redirect } from '@/lib/navigation'
import { setRequestLocale, getLocale } from 'next-intl/server'

// Auth page - redirects to projects if user is already logged in
export default async function AuthPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;

    // Set locale for next-intl (needed for translations in child components)
    setRequestLocale(locale);

    const user = await authService.getCurrentUser()
    if (user) {
        console.log('User is already logged in, redirecting to projects page')
        // Use next-intl's redirect with explicit locale parameter (official pattern)
        const currentLocale = await getLocale();
        redirect({href: '/projects', locale: currentLocale})
    }

    return <AuthPageClient />
}
