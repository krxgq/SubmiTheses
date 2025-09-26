import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import AuthPageClient from './AuthPageClient'

interface AuthPageProps {
    params: { locale: string }
}

export default async function AuthPage({ params }: AuthPageProps) {
    const { locale } = await params
    const dict = await getDictionary(locale as Locale)

    return <AuthPageClient dict={dict} locale={locale} />
}
