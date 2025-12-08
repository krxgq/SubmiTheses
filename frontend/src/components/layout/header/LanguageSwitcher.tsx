"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { usePathname } from "@/lib/navigation";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n-config";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    setShowMenu(false);
    const url = new URL(window.location.href);
    url.pathname = `/${newLocale}${pathname}`;
    window.location.href = url.href;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-primary hover:bg-background-hover rounded-lg transition-colors"
      >
        <div className="flex items-center">
          <Globe className="w-4 h-4" />
          <span className="ml-3 uppercase">{locale}</span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-xl overflow-hidden z-50">
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-background-hover transition-colors ${
              locale === "en" ? "text-primary font-medium" : "text-text-primary"
            }`}
          >
            English
          </button>
          <button
            onClick={() => switchLanguage('cz')}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-background-hover transition-colors ${
              locale === "cz" ? "text-primary font-medium" : "text-text-primary"
            }`}
          >
            Čeština
          </button>
        </div>
      )}
    </div>
  );
}
