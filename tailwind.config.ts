// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './lib/**/*.{js,ts,jsx,tsx,mdx}', // For any utils if styled
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for the app (optional: e.g., brand blue)
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        // Extend with code font
        mono: ['ui-monospace', 'Menlo', 'Monaco', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [], // Add e.g., typography if needed for prose
  darkMode: 'class', // Enables dark: prefix
};

export default config;
