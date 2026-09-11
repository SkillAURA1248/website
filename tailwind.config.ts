import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Color System ──────────────────────────────────────────────────
      colors: {
        // Backgrounds
        base: {
          DEFAULT: '#07090D',   // primary bg
          secondary: '#0C1017', // secondary bg
        },
        card: {
          DEFAULT: '#11151D',   // standard card
          elevated: '#151A24',  // elevated card
        },
        // Accent system
        purple: {
          50:  '#F3EEFF',
          100: '#E4D4FF',
          200: '#C9AAFF',
          300: '#A97EFF',
          400: '#8B5CF6',  // primary purple accent
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
          glow: 'rgba(139,92,246,0.35)',
          faint: 'rgba(139,92,246,0.08)',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',  // primary gold / CTA
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          glow: 'rgba(251,191,36,0.30)',
          faint: 'rgba(251,191,36,0.08)',
        },
        // Text
        text: {
          primary:   '#F4F6FA',
          secondary: '#8892A0',
          muted:     '#525C6A',
          disabled:  '#353D47',
        },
        // Border
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          subtle:  'rgba(255,255,255,0.05)',
          strong:  'rgba(255,255,255,0.14)',
        },
        // Status
        status: {
          online:    '#22C55E',
          available: '#34D399',
          upcoming:  '#60A5FA',
          completed: '#A78BFA',
          pending:   '#FBBF24',
          offline:   '#6B7280',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.08em' }],
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem',     { lineHeight: '1.625rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem',     letterSpacing: '-0.02em' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem',  letterSpacing: '-0.025em' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem',   letterSpacing: '-0.03em' }],
        '5xl':['3rem',     { lineHeight: '1.1',      letterSpacing: '-0.035em' }],
        '6xl':['3.75rem',  { lineHeight: '1.05',     letterSpacing: '-0.04em' }],
        '7xl':['4.5rem',   { lineHeight: '1',        letterSpacing: '-0.045em' }],
      },
      fontWeight: {
        thin:       '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
      },

      // ─── Spacing ───────────────────────────────────────────────────────
      spacing: {
        '0.5': '0.125rem',
        '1':   '0.25rem',
        '1.5': '0.375rem',
        '2':   '0.5rem',
        '2.5': '0.625rem',
        '3':   '0.75rem',
        '3.5': '0.875rem',
        '4':   '1rem',
        '5':   '1.25rem',
        '6':   '1.5rem',
        '7':   '1.75rem',
        '8':   '2rem',
        '9':   '2.25rem',
        '10':  '2.5rem',
        '11':  '2.75rem',
        '12':  '3rem',
        '14':  '3.5rem',
        '16':  '4rem',
        '18':  '4.5rem',
        '20':  '5rem',
        '24':  '6rem',
        '28':  '7rem',
        '32':  '8rem',
        '36':  '9rem',
        '40':  '10rem',
        '44':  '11rem',
        '48':  '12rem',
        '52':  '13rem',
        '56':  '14rem',
        '60':  '15rem',
        '64':  '16rem',
        '72':  '18rem',
        '80':  '20rem',
        '96':  '24rem',
      },

      // ─── Border Radius ─────────────────────────────────────────────────
      borderRadius: {
        none:  '0',
        sm:    '0.25rem',
        DEFAULT:'0.375rem',
        md:    '0.5rem',
        lg:    '0.75rem',
        xl:    '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full:  '9999px',
      },

      // ─── Box Shadows (depth + glow) ────────────────────────────────────
      boxShadow: {
        'card':          '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-elevated': '0 4px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
        'purple-sm':     '0 0 12px rgba(139,92,246,0.25)',
        'purple-md':     '0 0 24px rgba(139,92,246,0.30)',
        'purple-lg':     '0 0 48px rgba(139,92,246,0.40)',
        'gold-sm':       '0 0 12px rgba(251,191,36,0.25)',
        'gold-md':       '0 0 24px rgba(251,191,36,0.30)',
        'inner-subtle':  'inset 0 1px 0 rgba(255,255,255,0.05)',
        'none':          'none',
      },

      // ─── Background Images ─────────────────────────────────────────────
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'purple-blob': 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
        'nav-gradient': 'linear-gradient(180deg, rgba(7,9,13,0.95) 0%, rgba(7,9,13,0.85) 100%)',
      },

      // ─── Transitions ───────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'expo-out':'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },

      // ─── Animations ────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        'node-breathe': {
          '0%, 100%': { transform: 'scale(1)',    boxShadow: '0 0 8px rgba(139,92,246,0.4)' },
          '50%':      { transform: 'scale(1.06)', boxShadow: '0 0 20px rgba(139,92,246,0.7)' },
        },
        'line-draw': {
          '0%':   { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':      'fade-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-fast': 'fade-in-fast 0.25s ease both',
        'glow-pulse':   'glow-pulse 2.5s ease-in-out infinite',
        'node-breathe': 'node-breathe 3s ease-in-out infinite',
        'float':        'float 4s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'count-up':     'count-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },

      // ─── Backdrop Blur ─────────────────────────────────────────────────
      backdropBlur: {
        xs:  '2px',
        sm:  '4px',
        md:  '8px',
        lg:  '16px',
        xl:  '24px',
        '2xl':'40px',
      },
    },
  },
  plugins: [],
}

export default config
