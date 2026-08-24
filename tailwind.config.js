/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        primary: {
          DEFAULT: '#0f172a',
          foreground: '#ffffff',
          hover: '#1e293b',
          subtle: '#f1f5f9',
        },
        secondary: {
          DEFAULT: '#475569',
          foreground: '#f8fafc',
          subtle: '#f8fafc',
        },
        accent: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
          light: '#eff6ff',
          hover: '#1d4ed8',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ecfdf5',
          dark: '#065f46',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fffbeb',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
          border: '#e2e8f0',
        },
        muted: {
          DEFAULT: '#64748b',
          light: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        glow: '0 0 25px -5px rgba(37, 99, 235, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
