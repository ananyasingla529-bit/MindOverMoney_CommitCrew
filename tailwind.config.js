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
        brand: {
          50: '#F5F5F3',
          100: '#EBEBE6',
          200: '#D2D1C9',
          300: '#B8B7AB',
          400: '#9C9B8E',
          500: '#818070', // Minimal muted taupe
          600: '#67665A',
          700: '#4D4C43',
          800: '#34332D',
          900: '#1A1916',
          950: '#0E0D0C',
        },
        surface: {
          50: '#FCFBFA', // Clean off-white background
          100: '#F4F2EF', // Slightly darker for cards
          200: '#E6E3DE', // Borders
          300: '#D1CDCD',
          400: '#AFA9A4',
          500: '#87817B',
          600: '#645F59',
          700: '#494541',
          800: '#33302D',
          900: '#1F1E1B', // Primary Text
          950: '#12110F',
        },
        gold: {
          400: '#C2A370', // Muted sophisticated gold
          500: '#A88753',
          600: '#8A6D41',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'minimal': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
