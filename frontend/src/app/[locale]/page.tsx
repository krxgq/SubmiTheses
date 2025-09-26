import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import { redirect } from 'next/navigation'

interface PageProps {
    params: { locale: Locale }
}

export default async function Page({ params }: PageProps) {
    const { locale } = await params;

    // For now, redirect to auth since Supabase might not be configured
    // TODO: Add proper auth check when Supabase is configured
    try {
        // const { supabase } = await import('@/lib/supabase')
        // const { data: { user } } = await supabase.auth.getUser()
        // if (user) {
        //     redirect(`/${locale}/dashboard`)
        // } else {
        //     redirect(`/${locale}/auth`)
        // }
        redirect(`/${locale}/auth`)
    } catch (error) {
        // If there's any error (like missing env vars), redirect to auth
        redirect(`/${locale}/auth`)
    }

    return null
}