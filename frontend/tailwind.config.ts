import type { Config } from 'tailwindcss'

/**
 * Hygge design tokens — warm-meets-precise.
 * Cozy Scandinavian sand/cream neutrals, a refined teal accent, a warm amber
 * secondary. No generic AI purple. Everything references these tokens; never
 * hardcode hex in components.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF7F2',
          100: '#F4EEE4',
          200: '#E9DFCF',
          300: '#D9CBB3',
          400: '#C8B79A',
        },
        ink: {
          900: '#1C1A17',
          700: '#3A352E',
          500: '#6B6157',
          400: '#897E72',
        },
        teal: {
          50: '#E6FBF4',
          100: '#C5F4E5',
          400: '#16D9A8',
          500: '#0FB98E',
          600: '#0A9374',
          700: '#0A6E59',
        },
        amber: {
          200: '#FDE2B0',
          300: '#FBC97A',
          400: '#F0A93C',
          500: '#D98E1E',
        },
        clay: {
          400: '#EA7C68',
          500: '#E5634D',
        },
        // Dark theme surfaces (warm near-blacks, never cold gray)
        night: {
          bg: '#14120F',
          surface: '#1E1B16',
          raised: '#26221C',
          border: '#2C2823',
          text: '#F2ECE0',
          muted: '#A89E8F',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Geist Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // fluid display + tight editorial scale
        display: ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        h1: ['clamp(2.25rem, 4.5vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        h2: ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h3: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'mono-caption': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(40, 30, 20, 0.04), 0 2px 8px rgba(40, 30, 20, 0.04)',
        md: '0 4px 12px rgba(40, 30, 20, 0.06), 0 12px 32px rgba(40, 30, 20, 0.08)',
        lg: '0 12px 32px rgba(40, 30, 20, 0.10), 0 32px 64px rgba(40, 30, 20, 0.12)',
        glow: '0 8px 28px rgba(22, 217, 168, 0.32)',
        'glow-sm': '0 4px 16px rgba(22, 217, 168, 0.24)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(60% 60% at 20% 20%, rgba(22,217,168,0.28), transparent 60%), radial-gradient(55% 55% at 85% 25%, rgba(240,169,60,0.22), transparent 60%), radial-gradient(70% 70% at 50% 100%, rgba(197,244,229,0.35), transparent 65%)',
        'aurora-dark':
          'radial-gradient(60% 60% at 20% 20%, rgba(22,217,168,0.22), transparent 60%), radial-gradient(55% 55% at 85% 25%, rgba(240,169,60,0.16), transparent 60%), radial-gradient(70% 70% at 50% 100%, rgba(10,110,89,0.30), transparent 65%)',
        'cta-gradient': 'linear-gradient(135deg, #16D9A8 0%, #0FB98E 55%, #F0A93C 140%)',
      },
      maxWidth: {
        container: '1200px',
        prose: '68ch',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-3%,0) scale(1.08)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'aurora-drift': 'aurora-drift 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
