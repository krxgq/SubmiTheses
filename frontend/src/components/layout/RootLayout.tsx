import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import AppSidebar from './sidebar/Sidebar';
import Header from './header/Header';
import { checkRole } from '@/lib/auth/require-role';

// Root Layout component - Main application layout with sidebar, header, and toast notifications
export default async function RootLayout({ children }: { children: ReactNode }) {
  // Get user role from server-side auth check
  const { role } = await checkRole();
  const userRole = role || 'student';

  return (
    <div className="flex h-screen bg-background-secondary">
      <AppSidebar userRole={userRole} />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-background-secondary">{children}</main>
      </div>
      {/* Toast notifications - positioned at top-right */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
