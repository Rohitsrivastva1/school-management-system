/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'var(--background-light)',
        foreground: 'var(--text-dark)',
        primary: {
          DEFAULT: 'var(--primary-navy)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--secondary-sky)',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: 'var(--accent-emerald)',
          foreground: '#ffffff',
        },
        border: 'var(--border-light)',
        input: 'var(--border-light)',
        ring: 'var(--secondary-sky)',
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: 'var(--text-light)',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: 'var(--text-dark)',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: 'var(--text-dark)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
