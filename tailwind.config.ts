import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sidebar: {
          light: '#f3f4f6',
          dark: '#0a0a0a',
        },
        chat: {
          light: '#ffffff',
          dark: '#111111',
        },
      },
    },
  },
  plugins: [],
};

export default config;
