/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gaming: {
          dark: '#0a0a0a',
          primary: '#00ff88',
          secondary: '#ff0066',
          accent: '#ffff00',
        }
      },
      fontFamily: {
        gaming: ['Orbitron', 'monospace'],
      },
      animation: {
        'target-spawn': 'target-spawn 0.3s ease-out',
        'target-hit': 'target-hit 0.2s ease-in',
        'crosshair': 'crosshair 2s infinite',
      },
      keyframes: {
        'target-spawn': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'target-hit': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'crosshair': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 