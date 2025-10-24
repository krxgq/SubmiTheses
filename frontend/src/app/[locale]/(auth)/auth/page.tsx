import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import AuthPageClient from './AuthPageClient'
import { authService } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface AuthPageProps {
    params: { locale: string }
}

export default async function AuthPage({ params }: AuthPageProps) {
    const { locale } = params
    const dict = getDictionary(locale as Locale)

    const user = await authService.getCurrentUser()
    if (user) {
        redirect(`/${locale}/projects`)
    }

    return <AuthPageClient dict={await dict} locale={locale} />
}
