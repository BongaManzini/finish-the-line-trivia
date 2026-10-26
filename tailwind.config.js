/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#f59e0b',
          accentHover: '#d97706',
          primary: '#6366f1',
          primaryHover: '#4f46e5',
          danger: '#ef4444',
          success: '#10b981',
          buzz: '#ec4899',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'flip-in': 'flipIn 0.5s ease-out forwards',
        'buzz-ring': 'buzzRing 1.5s infinite',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' }
        },
        buzzRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(236, 72, 153, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 25px rgba(236, 72, 153, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(236, 72, 153, 0)' }
        }
      }
    },
  },
  plugins: [],
}
