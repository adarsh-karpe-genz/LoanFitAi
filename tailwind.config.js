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
        navy: {
          950: 'var(--navy-950)',
          800: 'var(--navy-800)',
          600: 'var(--navy-600)',
          450: 'var(--navy-450)',
          300: 'var(--navy-300)',
          150: 'var(--navy-150)',
          '050': 'var(--navy-050)',
        },
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          raised: 'var(--bg-raised)',
          glass: 'var(--bg-glass)',
        },
        txt: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        bdr: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        brand: {
          primary: 'var(--accent-primary)',
          data: 'var(--accent-data)',
        },
        status: {
          eligible: 'var(--status-eligible)',
          'eligible-bg': 'var(--status-eligible-bg)',
          borderline: 'var(--status-borderline)',
          'borderline-bg': 'var(--status-borderline-bg)',
          ineligible: 'var(--status-ineligible)',
          'ineligible-bg': 'var(--status-ineligible-bg)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '28px',
      },
      boxShadow: {
        raised: 'var(--shadow-raised)',
        subtle: '0 1px 2px rgba(0, 0, 42, 0.04)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        instant: '120ms',
        fast: '200ms',
        base: '320ms',
        slow: '560ms',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
