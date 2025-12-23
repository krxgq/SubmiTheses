import { redirect } from "next/navigation";
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Root page - middleware handles redirect, this just renders nothing
// Middleware will redirect to /auth or /projects based on session
export default async function RootPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    
    // Middleware handles all redirects, but we still need a fallback
    // If somehow we reach here, redirect to projects (middleware should prevent this)
    redirect(`/${locale}/projects`);
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}
