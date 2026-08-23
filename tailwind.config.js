/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0a0d14',
        iron: {
          950: '#11151f',
          900: '#181d2a',
          850: '#202637',
          800: '#2a3349',
          750: '#35405c',
          700: '#424f70',
          600: '#58678f',
          500: '#7585b0',
        },
        blood: {
          950: '#3b0808',
          900: '#580f0f',
          800: '#881b1b',
          700: '#b91c1c',
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171',
          300: '#fca5a5',
        },
        brass: {
          600: '#916f22',
          500: '#b8902f',
          400: '#deb243',
          300: '#f3ce65',
          200: '#fde68a',
          100: '#fef3c7',
        },
        rarity: {
          normal: '#d1d5db',
          magic: '#60a5fa',
          rare: '#fde047',
          unique: '#fb923c',
          runeword: '#fbbf24',
          legendary: '#f43f5e',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Palatino Linotype', 'Palatino', 'serif'],
        sans: ['Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      keyframes: {
        'hit-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        'chain-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0.4' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))' }
        }
      },
      animation: {
        'hit-shake': 'hit-shake 0.3s ease-in-out',
        'chain-pop': 'chain-pop 0.35s ease-out',
        'pulse-glow': 'pulse-glow 1.5s infinite',
      }
    },
  },
  plugins: [],
}
