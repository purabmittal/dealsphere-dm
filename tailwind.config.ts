import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1E3D',
          light: '#122A54',
          dark: '#071429',
        },
        skyblue: {
          DEFAULT: '#4A90D9',
          light: '#7DB4E8',
          dark: '#2E6FB0',
        },
        gold: {
          DEFAULT: '#C9A24B',
          light: '#DCC07E',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
