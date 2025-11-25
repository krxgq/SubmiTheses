import AppSidebar from '@/components/layout/sidebar/Sidebar';
import Header from '@/components/layout/header/Header';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
