import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin with the path to our i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

// Wrap the config with next-intl plugin
export default withNextIntl(nextConfig);
