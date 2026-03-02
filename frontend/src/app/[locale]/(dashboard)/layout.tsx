import { headers } from "next/headers";
import { Toaster } from "sonner";
import AppSidebar from "@/components/layout/sidebar/Sidebar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { AccessDenied } from "@/components/auth/AccessDenied";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Force dynamic rendering - this layout uses headers() for access control
// which makes all dashboard routes dynamic (correct for authenticated pages)
export const dynamic = "force-dynamic";

// Disable caching completely to ensure fresh access control checks on every navigation
// This prevents showing stale AccessDenied state when navigating between protected routes
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const headersList = await headers();
  const accessDenied = headersList.get("x-access-denied") === "true";
  const requiredRoles = headersList.get("x-required-roles")?.split(",") || [];
  const currentRole = headersList.get("x-current-role") || "student";

  if (accessDenied) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar userRole={currentRole as any} />
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <Breadcrumbs />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <AccessDenied
                requiredRoles={requiredRoles}
                currentRole={currentRole}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar userRole={currentRole as any} />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto sm:p-2 lg:p-10">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
      {/* Toast notifications styled with theme colors */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-background-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          classNames: {
            success: 'toast-success',
            error: 'toast-error',
            warning: 'toast-warning',
            info: 'toast-info',
          },
        }}
      />
    </div>
  );
}
