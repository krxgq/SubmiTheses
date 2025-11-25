import { getRequestConfig } from 'next-intl/server';
import { routing } from './lib/navigation';

/**
 * next-intl configuration
 * This function loads the appropriate translation messages based on the locale
 * IMPORTANT: Must return both locale and messages for next-intl to work properly
 *
 * Fixed: Use routing.locales instead of i18n.locales to ensure consistency
 * This prevents the /undefinedundefined issue by ensuring locale is always valid
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // In next-intl v4, we should use requestLocale instead of locale
  // await the requestLocale to get the actual value
  let locale = await requestLocale;

  // Validate that the incoming locale parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}/common.json`)).default,
  };
});
