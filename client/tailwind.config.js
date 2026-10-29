/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        cardinal: '#8b0000',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'card-flip': 'cardFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.9', boxShadow: '0 0 15px rgba(234, 179, 8, 0.6)' },
          '50%': { opacity: '1', boxShadow: '0 0 30px rgba(234, 179, 8, 0.9)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
}
