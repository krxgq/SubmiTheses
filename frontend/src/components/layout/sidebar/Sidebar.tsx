"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/lib/navigation";
import { 
  GraduationCap, 
  Folder, 
  Users, 
  Settings, 
  Menu, 
  X,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  LogOut,
  Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
} from "flowbite-react";
import type { UserRole } from "@sumbi/shared-types";
import { useTheme } from "next-themes";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "@/components/layout/header/LanguageSwitcher";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  allowedRoles: UserRole[];
}

const allNavItems: NavItem[] = [
  {
    id: "projects",
    label: "Projects",
    icon: Folder,
    path: "/projects",
    allowedRoles: ["admin", "teacher", "student"],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: "/notifications",
    allowedRoles: ["admin", "teacher", "student"],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/users",
    allowedRoles: ["admin"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    allowedRoles: ["admin", "teacher", "student"],
  },
];

interface AppSidebarProps {
  userRole: UserRole;
}

export default function AppSidebar({ userRole }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(userRole),
  );

  const isActiveItem = (itemPath: string) => {
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  const handleNavigation = (itemPath: string) => {
    router.push(itemPath);
    router.refresh();
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowUserMenu(false);
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />;
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

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
            <GraduationCap className="mx-2 text-primary" size={48} />
            <span className="font-bold text-xl text-primary">SubmiTheses</span>
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

        <div className="w-0.8 mx-2 rounded bg-border-strong h-0.5 mb-2" />

        {/* Bottom Controls */}
        <div className="p-4 space-y-2">
          {/* Theme Toggle Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-primary hover:bg-background-hover rounded-lg transition-colors"
            >
              <div className="flex items-center">
                {getThemeIcon()}
                <span className="ml-3 capitalize">{mounted ? theme || 'system' : 'Theme'}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showThemeMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Sun className="w-4 h-4 mr-3" />
                  Light
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Moon className="w-4 h-4 mr-3" />
                  Dark
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Monitor className="w-4 h-4 mr-3" />
                  System
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-background-hover rounded-lg transition-colors"
            >
              <div className="flex items-center min-w-0">
                <Avatar src={user?.avatar_url} name={user?.full_name} size="sm" />
                <div className="ml-3 text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-secondary truncate">
                    {user?.role || 'Role'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => { handleNavigation('/settings'); setShowUserMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                <div className="border-t border-border"></div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors flex items-center disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger mr-3"></div>
                  ) : (
                    <LogOut className="w-4 h-4 mr-3" />
                  )}
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
