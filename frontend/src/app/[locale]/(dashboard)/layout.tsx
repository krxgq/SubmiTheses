import { headers } from 'next/headers';
import AppSidebar from '@/components/layout/sidebar/Sidebar';
import Header from '@/components/layout/header/Header';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AccessDenied } from '@/components/auth/AccessDenied';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Force dynamic rendering - this layout uses headers() for access control
// which makes all dashboard routes dynamic (correct for authenticated pages)
export const dynamic = 'force-dynamic';

// Disable caching completely to ensure fresh access control checks on every navigation
// This prevents showing stale AccessDenied state when navigating between protected routes
export const revalidate = 0;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const headersList = await headers();
  const accessDenied = headersList.get('x-access-denied') === 'true';
  const requiredRoles = headersList.get('x-required-roles')?.split(',') || [];
  const currentRole = headersList.get('x-current-role') || 'student';

  if (accessDenied) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar userRole={currentRole as any} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumbs />
          <main className="flex-1 overflow-y-auto p-6">
            <AccessDenied
              requiredRoles={requiredRoles}
              currentRole={currentRole}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar userRole={currentRole as any} />
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
