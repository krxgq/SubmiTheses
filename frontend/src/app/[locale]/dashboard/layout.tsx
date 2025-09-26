import { ReactNode } from 'react';
import AppSidebar from '@/components/layout/sidebar/Sidebar';
import Header from '@/components/layout/header/Header';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n-config';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <div className="flex h-screen bg-background dark:bg-background-dark">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <Header locale={locale as Locale} dictionary={dictionary} />
        <main className="flex-1 overflow-y-auto bg-background dark:bg-background-dark">{children}</main>
      </div>
    </div>
  );
}