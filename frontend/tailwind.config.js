// tailwind.config.js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            '--tw-prose-strong': 'white',
            '--tw-prose-code': 'white',
          },
        },
      },
    },
  },
  plugins: [typography],
};
