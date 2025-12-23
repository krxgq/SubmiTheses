import AuthPageClient from './AuthPageClient'
import { setRequestLocale } from 'next-intl/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Auth page - middleware handles redirect if already logged in
// No need to check session here, middleware does it faster
export default async function AuthPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    
    // Middleware redirects logged-in users to /projects
    // If we reach here, user is not logged in
    return <AuthPageClient />
}
