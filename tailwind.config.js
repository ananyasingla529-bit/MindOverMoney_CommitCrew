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
          50: '#EBF0FB',
          100: '#D6E1F8',
          200: '#ADC3F1',
          300: '#85A5EA',
          400: '#5C87E3',
          500: '#2F6FED',
          600: '#2659BE',
          700: '#1C438E',
          800: '#132C5F',
          900: '#17324D',
          950: '#0E1F30',
        },
        surface: {
          50: '#F7F3EA',
          100: '#FFFDF8',
          200: '#E8E4DA',
          300: '#D5D0C6',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#526273',
          700: '#3B4A56',
          800: '#2A3640',
          900: '#17324D',
          950: '#0E1F30',
        },
        gold: {
          400: '#D4A853',
          500: '#B8922F',
          600: '#8A6D41',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'minimal': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
