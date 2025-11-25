import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/navigation';

// Root page redirects to auth or projects based on session
export default async function RootPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;

    // Set locale for next-intl (needed for translations in other components)
    setRequestLocale(locale);

    // Use server-side Supabase client to properly read cookies in Server Component
    // Use getUser() for secure authentication validation instead of getSession()
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Redirect with locale prefix - using Next.js redirect directly
    // No need for custom redirect since we already have locale from params
    if (user && !error) {
        redirect(`/${locale}/projects`);
    } else {
        redirect(`/${locale}/auth`);
    }
}

// Generate static params for all locales to help Next.js understand the routes
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}
