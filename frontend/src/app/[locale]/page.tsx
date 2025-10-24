import { redirect, RedirectType } from "next/navigation";
import { authService } from "@/lib/auth";
import type { Locale } from "@/lib/i18n-config";

export default async function RootPage({params}: {params: {locale: Locale}}) {
    const { locale } = params;
    const user = await authService.getCurrentUser();

    if (user) {
        redirect(`/${locale}/projects`, RedirectType.replace);
    } else {
        redirect(`/${locale}/auth`, RedirectType.replace);
    }
}
