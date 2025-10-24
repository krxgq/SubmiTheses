'use client'

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Folder, Star, Paperclip, ExternalLink, GraduationCap, Users, Settings, Menu, X } from 'lucide-react';
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'projects', label: 'Projects', icon: Folder, path: '/projects' },
    { id: 'reviews', label: 'Reviews', icon: Star, path: '/reviews' },
    { id: 'attachments', label: 'Attachments', icon: Paperclip, path: '/attachments' },
    { id: 'links', label: 'External Links', icon: ExternalLink, path: '/links' },
    { id: 'schools', label: 'Schools', icon: GraduationCap, path: '/schools' },
    { id: 'users', label: 'Users', icon: Users, path: '/users' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const getCurrentLocale = () => {
    const segments = pathname.split('/');
    return segments[1] || 'en'; // Default to 'en' if no locale found
  };

  const isActiveItem = (itemPath: string) => {
    const locale = getCurrentLocale();
    const currentPath = pathname.replace(`/${locale}`, '');
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  const handleNavigation = (itemPath: string) => {
    const locale = getCurrentLocale();
    router.push(`/${locale}${itemPath}`);
    setIsOpen(false); // Close mobile menu
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-secondary rounded-lg hover:bg-background-hover"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-backdrop"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-background-elevated shadow-sm border-r border-border flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg mr-3"></div>
            <span className="font-bold text-xl text-primary">SubmiTheses</span>
          </div>
        </div>

          <div className='w-0.8 mx-2 rounded bg-border-strong h-0.5'/>

        {/* Navigation */}
        <Sidebar className="flex-1 bg-transparent shadow-none border-r border-border">
          <SidebarItems >
            <SidebarItemGroup className='border-none'>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActiveItem(item.path);
                return (
                  <SidebarItem
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className="text-sm font-medium border-none transition-colors cursor-pointer"
                    style={isActive ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-text-inverse)'
                    } : {}}
                  >
                    <div className={`flex items-center ${isActive ? '' : 'text-secondary hover:bg-background-hover'}`}>
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