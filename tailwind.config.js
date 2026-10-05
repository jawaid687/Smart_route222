/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#090d16',
          850: '#0d1322',
          800: '#131b2e',
          750: '#17223b',
          700: '#1e293b',
          600: '#334155',
          500: '#64748b',
        },
        escape: {
          green: '#10b981',
          emerald: '#059669',
          glow: '#34d399',
        },
        danger: {
          DEFAULT: '#ef4444',
          glow: '#f87171',
          dark: '#991b1b',
        },
        warning: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
        },
        neon: {
          blue: '#38bdf8',
          purple: '#a855f7',
          amber: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        bangla: ['Noto Sans Bengali', 'Hind Siliguri', 'sans-serif'],
      },
      animation: {
        'flow-dash': 'flowDash 1.2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'beacon': 'beacon 1.8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        flowDash: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        beacon: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.3)', opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
