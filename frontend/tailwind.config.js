/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (auto light/dark via CSS variables)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep) / <alpha-value>)',
          bright: 'rgb(var(--brand-bright) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
        },

        // Legacy aliases (kept so existing utility classes render in the red/white theme)
        ink: 'rgb(var(--surface) / <alpha-value>)',
        navy: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          800: 'rgb(var(--elevated) / <alpha-value>)',
          700: 'rgb(var(--elevated) / <alpha-value>)',
          600: 'rgb(var(--line) / <alpha-value>)',
        },
        snow: 'rgb(var(--content) / <alpha-value>)',
        azure: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          600: 'rgb(var(--brand-deep) / <alpha-value>)',
          400: 'rgb(var(--brand-bright) / <alpha-value>)',
          300: 'rgb(var(--brand-bright) / <alpha-value>)',
        },
        aqua: 'rgb(var(--brand-bright) / <alpha-value>)',
        flame: 'rgb(var(--brand-deep) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(225,29,46,.22), 0 22px 55px -24px rgba(225,29,46,.45)',
        'glow-aqua': '0 0 34px -8px rgba(239,68,68,.5)',
        'glow-flame': '0 0 34px -8px rgba(153,27,27,.5)',
        card: '0 24px 50px -32px rgba(17,17,17,.28)',
      },
      backgroundImage: {
        'grid-brand':
          'linear-gradient(rgba(225,29,46,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,46,.07) 1px, transparent 1px)',
        'radial-brand': 'radial-gradient(circle at 50% 0%, rgba(225,29,46,.18), transparent 62%)',
      },
      backgroundSize: {
        grid: '42px 42px',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'grid-pan': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '42px 42px' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4.5s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        marquee: 'marquee 30s linear infinite',
        'grid-pan': 'grid-pan 22s linear infinite',
        'fade-up': 'fade-up .6s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
}
