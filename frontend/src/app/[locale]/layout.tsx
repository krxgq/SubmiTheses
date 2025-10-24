
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { i18n, type Locale } from '../../lib/i18n-config'
interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!i18n.locales.includes(locale as Locale)) {
    notFound()
  }

  return children;
}
