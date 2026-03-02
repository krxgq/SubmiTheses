import AppSidebar from "@/components/layout/sidebar/Sidebar";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Layout for unauthenticated (guest) pages.
 * Same visual structure as dashboard but with guest sidebar (only Projects + login button).
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar userRole="guest" isPublic />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <main className="flex-1 overflow-y-auto sm:p-2 lg:p-10">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
