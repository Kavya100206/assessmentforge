import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        accent: {
          DEFAULT: '#E91E63',
          50: '#FCE7EE',
          100: '#FBD0DD',
          500: '#E91E63',
          600: '#D81B60',
        },
        // Surfaces
        surface: {
          page: '#F8F8F8',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
        },
        // Text
        ink: {
          DEFAULT: '#111111',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
        // Borders
        line: {
          DEFAULT: '#ECECEC',
          soft: '#F5F5F5',
        },
        // Badge (orange/red — per Figma)
        badge: '#FF4D2E',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        floating: '0 8px 24px -8px rgb(0 0 0 / 0.18)',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
export default config;
