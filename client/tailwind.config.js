/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#252540',
          lighter: '#2d2d4a',
        },
        accent: {
          DEFAULT: '#6c5ce7',
          light: '#a29bfe',
          dark: '#4834d4',
        },
      },
    },
  },
  plugins: [],
};
