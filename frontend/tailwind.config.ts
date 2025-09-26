import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite-react/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Your specified color system
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          elevated: 'var(--color-background-elevated)',
          hover: 'var(--color-background-hover)',
          active: 'var(--color-background-active)',
        },

        surface: {
          DEFAULT: 'var(--color-surface)',
          overlay: 'var(--color-surface-overlay)',
        },

        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
          accent: 'var(--color-text-accent)',
        },

        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          subtle: 'var(--color-border-subtle)',
          primary: 'var(--color-border)',
        },

        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
        },

        interactive: {
          primary: 'var(--color-interactive-primary)',
          'primary-hover': 'var(--color-interactive-primary-hover)',
          secondary: 'var(--color-interactive-secondary)',
          'secondary-hover': 'var(--color-interactive-secondary-hover)',
        },

        input: {
          background: 'var(--color-input-background)',
        },

        accent: {
          success: 'var(--color-accent-success)',
          warning: 'var(--color-accent-warning)',
          danger: 'var(--color-accent-danger)',
        },

        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
        },

        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
        },

        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
        },

        backdrop: 'var(--color-backdrop)',
        focus: 'var(--color-focus)',
        selection: 'var(--color-selection)',

        // Aliases for backward compatibility
        bg: {
          primary: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          overlay: 'var(--color-backdrop)',
        },
      },
    },
  },
  plugins: [require('flowbite-react/plugin')],
}

export default config
