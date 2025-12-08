import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

// Create the next-intl plugin with the path to our i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // Tell Next.js that this is the actual project root for middleware
  serverExternalPackages: [],
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Copy PDFKit font data files to the server output
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
      
      // Add pdfkit data directory to the module resolution
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        path.resolve(process.cwd(), '../node_modules/.pnpm/pdfkit@0.17.2/node_modules/pdfkit/js')
      ];
    }
    
    return config;
  },
};

// Wrap the config with next-intl plugin
export default withNextIntl(nextConfig);
