'use client'
import { Search, Bell, ChevronDown, X, Globe, User, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n-config';

interface HeaderProps {
    locale?: Locale;
    dictionary?: Awaited<ReturnType<typeof getDictionary>>;
}

export default function Header({ locale = 'en', dictionary }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthContext();

    // Fallback dictionary for when props are not provided
    const fallbackDictionary = {
        header: {
            theme: {
                toggleDark: "Switch to dark mode",
                toggleLight: "Switch to light mode"
            },
            language: {
                select: "Select language",
                english: "English",
                czech: "Čeština"
            }
        }
    };

    const t = dictionary || fallbackDictionary;
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const languageMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // TODO(human) - Implement search suggestions data
    const searchSuggestions = [
        'React components',
        'TypeScript interfaces',
        'API documentation',
        'CSS animations',
        'JavaScript functions'
    ];

    // Mock notifications data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'New project submitted',
            message: 'John Doe submitted "AI Research Thesis"',
            time: '2 minutes ago',
            unread: true,
            type: 'project'
        },
        {
            id: 2,
            title: 'Review completed',
            message: 'Sarah Wilson completed review for "Machine Learning"',
            time: '1 hour ago',
            unread: true,
            type: 'review'
        },
        {
            id: 3,
            title: 'System update',
            message: 'New features have been deployed',
            time: '3 hours ago',
            unread: false,
            type: 'system'
        }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const filteredSuggestions = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchModalOpen(true);
            }
            if (e.key === 'Escape') {
                if (isSearchModalOpen) {
                    setIsSearchModalOpen(false);
                    setSearchQuery('');
                } else {
                    // Close any open dropdowns
                    setShowLanguageMenu(false);
                    setShowNotifications(false);
                    setShowUserMenu(false);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSearchModalOpen]);

    useEffect(() => {
        if (isSearchModalOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isSearchModalOpen]);


    // Language switching functionality
    const changeLanguage = (newLocale: Locale) => {
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
        setShowLanguageMenu(false);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
                setShowLanguageMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, unread: false }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, unread: false }))
        );
    };

    const clearNotification = (notificationId: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setShowUserMenu(false);
            router.push(`/${locale}/auth`);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const getUserInitials = () => {
        if (user?.username) {
            return user.username.substring(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    const getDisplayName = () => {
        return user?.username || user?.email?.split('@')[0] || 'User';
    };

    const handleNavigation = (path: string) => {
        router.push(`/${locale}${path}`);
    };

    return (
        <>
            <header className="bg-background-card dark:bg-background-dark-card shadow-sm border-b border-border dark:border-border-dark px-6 py-4">
                <div className="flex items-center justify-end">

                    {/* Compact Search Button */}
                    <div className="mx-8">
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="flex items-center px-3 py-2 text-sm text-foreground-muted bg-muted dark:bg-muted-dark hover:bg-background-secondary dark:hover:bg-muted-dark rounded-lg transition-colors duration-200"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Search...</span>
                            <span className="ml-2 text-xs text-tertiary hidden sm:inline">(⌘K)</span>
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Language Switcher */}
                        <div className="relative" ref={languageMenuRef}>
                            <button
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                className="flex items-center p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background-hover"
                                title={t.header.language.select}
                            >
                                <Globe className="w-5 h-5" />
                                <span className="ml-1 text-xs uppercase">{locale}</span>
                            </button>

                            {/* Language Dropdown */}
                            {showLanguageMenu && (
                                <div className="absolute right-0 mt-2 w-32 bg-background-elevated border border rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => changeLanguage('en')}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-background-hover transition-colors ${locale === 'en' ? 'text-primary font-medium' : 'text-primary'
                                                }`}
                                        >
                                            {t.header.language.english}
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('cz')}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-background-hover transition-colors ${locale === 'cz' ? 'text-primary font-medium' : 'text-primary'
                                                }`}
                                        >
                                            {t.header.language.czech}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-background-hover"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-danger text-text-inverse text-xs rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-background-elevated border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                                    {/* Header */}
                                    <div className="px-4 py-3 border-b  flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-primary">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-interactive-primary hover:text-interactive-primary-hover"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-3 border-b transition-colors hover:bg-background-hover ${notification.unread ? 'bg-background-hover' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <p className="text-sm font-medium truncate text-primary">
                                                                    {notification.title}
                                                                </p>
                                                                {notification.unread && (
                                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs mt-1 text-secondary">{notification.message}</p>
                                                            <p className="text-xs mt-1 text-tertiary">{notification.time}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-2">
                                                            {notification.unread && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="p-1 text-tertiary hover:text-primary transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <div className="w-3 h-3 rounded-full border border-current"></div>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => clearNotification(notification.id)}
                                                                className="p-1 text-tertiary hover:text-primary transition-colors"
                                                                title="Clear notification"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-8 text-center text-secondary">
                                                <Bell className="w-8 h-8 mx-auto mb-2 text-tertiary" />
                                                <p className="text-sm">No notifications</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-4 py-3 bg-background-secondary border-t border">
                                        <button className="w-full text-center text-sm text-primary hover:text-primary transition-colors">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background-hover transition-colors"
                            >
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-inverse font-semibold">
                                    {getUserInitials()}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-primary">{getDisplayName()}</p>
                                    <p className="text-xs text-secondary">{user?.email || 'user@example.com'}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-secondary" />
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-background-elevated border rounded-lg shadow-xl z-50">
                                    <div className="py-1">
                                        <div className="px-3 py-2 border-b">
                                            <p className="text-sm font-medium text-primary">{getDisplayName()}</p>
                                            <p className="text-xs truncate text-secondary">{user?.email}</p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                handleNavigation('/profile');
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background-hover transition-colors flex items-center"
                                        >
                                            <User className="w-4 h-4 mr-3" />
                                            Profile
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleNavigation('/settings');
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background-hover transition-colors flex items-center"
                                        >
                                            <Settings className="w-4 h-4 mr-3" />
                                            Settings
                                        </button>

                                        <div className="border-t border my-1"></div>

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
                    </div>
                </div>
            </header>

            {/* Full-Screen Search Modal */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 bg-backdrop z-50 flex items-start justify-center pt-20">
                    <div className="w-full max-w-2xl mx-4">
                        <div className="bg-background-elevated rounded-xl shadow-2xl overflow-hidden">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-secondary w-6 h-6" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search documentation, guides, and more..."
                                    className="w-full pl-16 pr-16 py-6 text-xl bg-transparent text-primary placeholder-secondary border-0 focus:outline-none focus:ring-0"
                                />
                                <button
                                    onClick={() => {
                                        setIsSearchModalOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchQuery && (
                                <div className="border-t border max-h-96 overflow-y-auto">
                                    {filteredSuggestions.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wide bg-background-secondary">
                                                Suggestions
                                            </div>
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    className="w-full px-6 py-4 text-left text-primary hover:bg-background-hover transition-colors flex items-center"
                                                    onClick={() => {
                                                        setSearchQuery(suggestion);
                                                        setIsSearchModalOpen(false);
                                                    }}
                                                >
                                                    <Search className="w-5 h-5 text-secondary mr-4" />
                                                    <span className="text-base">{suggestion}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-6 py-8 text-center text-secondary">
                                            <Search className="w-12 h-12 mx-auto text-tertiary mb-4" />
                                            <p>No results found for "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-6 py-4 bg-background-secondary border-t border text-xs text-secondary flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span>Press <kbd className="px-2 py-1 bg-background-elevated border border rounded text-xs">↵</kbd> to select</span>
                                    <span>Press <kbd className="px-2 py-1 bg-background-elevated border border rounded text-xs">Esc</kbd> to close</span>
                                </div>
                                <span>⌘K to search</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
