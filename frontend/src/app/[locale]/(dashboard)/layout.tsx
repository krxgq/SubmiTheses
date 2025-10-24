import AppSidebar from '@/components/layout/sidebar/Sidebar';
import Header from '@/components/layout/header/Header';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n-config';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
