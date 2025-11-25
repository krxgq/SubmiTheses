'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Globe } from 'lucide-react';
import { usePathname } from '@/lib/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n-config';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations('header');
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
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

  const changeLanguage = (newLocale: Locale) => {
    setShowMenu(false);
    startTransition(() => {
      const url = new URL(window.location.href);
      url.pathname = `/${newLocale}${pathname}`;
      window.location.href = url.href;
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background-hover"
        title={t('language.select')}
      >
        <Globe className="w-5 h-5" />
        <span className="ml-1 text-xs uppercase">{locale}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-32 bg-background-elevated border-border rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => changeLanguage('en')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-background-hover transition-colors ${
                locale === 'en'
                  ? 'text-primary font-medium'
                  : 'text-primary'
              }`}
            >
              {t('language.english')}
            </button>
            <button
              onClick={() => changeLanguage('cz')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-background-hover transition-colors ${
                locale === 'cz'
                  ? 'text-primary font-medium'
                  : 'text-primary'
              }`}
            >
              {t('language.czech')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
