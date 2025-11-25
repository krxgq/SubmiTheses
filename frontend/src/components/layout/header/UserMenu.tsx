'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useRouter } from '@/lib/navigation';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowMenu(false);
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background-hover transition-colors"
      >
        <Avatar src={user?.avatar_url} name={user?.full_name} />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-primary">
            {user?.full_name || 'User'}
          </p>
          <p className="text-xs text-secondary">
            {user?.email || 'user@example.com'}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-secondary" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-background-elevated border-border rounded-lg shadow-xl z-50">
          <div className="py-1">
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background-hover transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </button>

            <div className="border-t border-border my-1"></div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors flex items-center disabled:opacity-50"
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger mr-3"></div>
              ) : (
                <LogOut className="w-4 h-4 mr-3" />
              )}
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
