"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/lib/navigation";
import { Folder, Users, Settings, Menu, X } from "lucide-react";
import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
} from "flowbite-react";
import type { UserRole } from "@sumbi/shared-types";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  allowedRoles: UserRole[];
}

const allNavItems: NavItem[] = [
  { id: "projects", label: "Projects", icon: Folder, path: "/projects", allowedRoles: ["admin", "teacher", "student"] },
  { id: "users", label: "Users", icon: Users, path: "/users", allowedRoles: ["admin"] },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings", allowedRoles: ["admin", "teacher", "student"] },
];

interface AppSidebarProps {
  userRole: UserRole;
}

export default function AppSidebar({ userRole }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = allNavItems.filter(item => item.allowedRoles.includes(userRole));

  const isActiveItem = (itemPath: string) => {
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  const handleNavigation = (itemPath: string) => {
    router.push(itemPath);
    router.refresh();
    setIsOpen(false);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-text-secondary rounded-lg hover:bg-background-hover"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-background-elevated shadow-sm border-r border-border flex flex-col
      `}
      >
        {/* Logo */}
        <div className="p-6 mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg mr-3"></div>
            <span className="font-bold text-xl text-primary">
              SubmiTheses
            </span>
          </div>
        </div>

        <div className="w-0.8 mx-2 rounded bg-border-strong h-0.5" />

        {/* Navigation */}
        <Sidebar className="flex-1 bg-transparent shadow-none border-none">
          <SidebarItems>
            <SidebarItemGroup className="border-none">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActiveItem(item.path);
                return (
                  <SidebarItem
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`text-sm font-medium border-none transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary hover:bg-primary-hover !text-text-inverse"
                        : "hover:bg-background-hover !text-text-primary"
                    }`}
                  >
                    <div className="flex items-center">
                      <IconComponent className="mr-3 w-5 h-5" />
                      {item.label}
                    </div>
                  </SidebarItem>
                );
              })}
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>
      </div>
    </>
  );
}

