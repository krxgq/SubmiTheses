import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth/session-validator";
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/navigation';

// Force dynamic rendering since we validate session
export const dynamic = 'force-dynamic';

// Root page redirects to auth or projects based on session
export default async function RootPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;

    // Set locale for next-intl (needed for translations in other components)
    setRequestLocale(locale);

    // Validate session using backend API (NO Supabase)
    const user = await validateSession();

    // Redirect with locale prefix - using Next.js redirect directly
    // No need for custom redirect since we already have locale from params
    if (user) {
        redirect(`/${locale}/projects`);
    } else {
        redirect(`/${locale}/auth`);
    }
}

// Generate static params for all locales to help Next.js understand the routes
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}
