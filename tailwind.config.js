/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./concierge.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#07090b',
          900: '#0d0f12',
          850: '#13161b',
          800: '#1a1e24',
          700: '#282e38',
          600: '#3e4756',
          500: '#5a667b'
        },
        bronze: {
          300: '#f6d8a8',
          400: '#e5be7d',
          500: '#c89b4e',
          600: '#ad7e35',
          700: '#8a5f22',
          800: '#684515',
          900: '#4a300d'
        }
      },
      fontFamily: {
        serif: ['Syne', 'Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'bronze-glow': '0 0 25px -5px rgba(200, 155, 78, 0.25)',
        'bronze-subtle': '0 0 15px -3px rgba(200, 155, 78, 0.15)',
        'modal-dark': '0 24px 48px -12px rgba(0, 0, 0, 0.85)'
      }
    },
  },
  plugins: [],
}
