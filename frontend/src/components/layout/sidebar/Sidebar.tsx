"use client";
import { formatUserName } from "@/lib/formatters";

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
  Bell,
  FileSliders,
} from "lucide-react";
import type { UserRole } from "@sumbi/shared-types";
import { useTheme } from "next-themes";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "@/components/layout/header/LanguageSwitcher";
import { useTranslations } from "next-intl";

interface NavItem {
  id: string;
  translationKey: string;
  icon: any;
  path: string;
  allowedRoles: UserRole[];
}

const allNavItems: NavItem[] = [
  {
    id: "projects",
    translationKey: "projects",
    icon: Folder,
    path: "/projects",
    allowedRoles: ["admin", "teacher", "student"],
  },
  {
    id: "notifications",
    translationKey: "notifications",
    icon: Bell,
    path: "/notifications",
    allowedRoles: ["admin", "teacher", "student"],
  },
  {
    id: "users",
    translationKey: "users",
    icon: Users,
    path: "/users",
    allowedRoles: ["admin"],
  },
  {
    id: "settings",
    translationKey: "settings",
    icon: Settings,
    path: "/settings",
    allowedRoles: ["admin", "teacher", "student"],
  },
  {
    id: "adminPanel",
    translationKey: "adminPanel",
    icon: FileSliders,
    path: "/admin",
    allowedRoles: ["admin"],
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
  const t = useTranslations("sidebar");
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
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target as Node)
      ) {
        setShowThemeMenu(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
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
      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />;
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
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
        {/* Logo - Centered, Prominent */}
        <div className="px-6 pt-8 pb-6 mb-6 text-center">
          <div className="flex flex-col items-center">
            <GraduationCap className="text-accent mb-3" size={56} />
            <div className="font-bold text-lg text-accent leading-tight">
              <div>SubmiTheses</div>
            </div>
          </div>
        </div>

        {/* Navigation - Custom Pill Style */}
        <nav className="flex-1 px-4 py-4 bg-background-secondary/30 flex flex-col gap-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveItem(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-text-inverse shadow-sm"
                      : "text-text-primary hover:bg-background-hover"
                  }
                `}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span>{t(item.translationKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 space-y-2 bg-background-secondary/50">
          {/* Theme Toggle Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-primary hover:bg-background-hover rounded-lg transition-colors"
            >
              <div className="flex items-center">
                {getThemeIcon()}
                <span className="ml-3 capitalize">
                  {mounted ? t(`theme.${theme || "system"}`) : t("theme.label")}
                </span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showThemeMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    setTheme("light");
                    setShowThemeMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Sun className="w-4 h-4 mr-3" />
                  {t("theme.light")}
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    setShowThemeMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Moon className="w-4 h-4 mr-3" />
                  {t("theme.dark")}
                </button>
                <button
                  onClick={() => {
                    setTheme("system");
                    setShowThemeMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Monitor className="w-4 h-4 mr-3" />
                  {t("theme.system")}
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
                <Avatar
                  src={user?.avatar_url}
                  name={formatUserName(user?.first_name, user?.last_name)}
                  size="sm"
                />
                <div className="ml-3 text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">
                    {formatUserName(user?.first_name, user?.last_name) ||
                      t("user.label")}
                  </p>
                  <p className="text-xs text-secondary truncate">
                    {user?.role || t("user.role")}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    handleNavigation("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background-hover transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  {t("settings")}
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
                  {isLoggingOut ? t("user.signingOut") : t("user.signOut")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
