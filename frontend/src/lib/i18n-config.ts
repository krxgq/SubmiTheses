import { routing } from './navigation';

// Re-export from navigation.ts for backwards compatibility
// navigation.ts is the single source of truth for locale configuration
export const i18n = {
  defaultLocale: routing.defaultLocale,
  locales: routing.locales,
} as const;

export type Locale = (typeof routing.locales)[number];