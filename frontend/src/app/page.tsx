import { redirect } from 'next/navigation';
import { i18n } from '@/lib/i18n-config';

export default function RootPage() {
  // Detect user's preferred language
  // For now, defaulting to English, but you could add browser language detection
  const defaultLocale = i18n.defaultLocale;

  // Redirect to the default locale
  redirect(`/${defaultLocale}`);
}