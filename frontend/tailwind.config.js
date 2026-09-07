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
        cafe: {
          50: '#fbf8f5',
          100: '#f5efe8',
          200: '#e8dbce',
          300: '#d6beab',
          400: '#bf9d82',
          500: '#a87f5f',
          600: '#8e6547',
          700: '#734e37',
          800: '#5e402f',
          900: '#4e3629',
          950: '#2b1c15',
        },
        amber: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
        },
        dark: {
          bg: '#0f1117',
          surface: '#181b24',
          card: '#1f2430',
          border: '#2c3242',
          muted: '#8f9bb3',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'pos': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'pos-dark': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
