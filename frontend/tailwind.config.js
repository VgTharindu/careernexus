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
        navy: {
          900: '#001F3F',
          800: '#002D5A',
          700: '#003366',
          600: '#004080',
          500: '#0055AA',
        },
        electric: {
          300: '#80BFFF',
          400: '#3399FF',
          500: '#007BFF',
          600: '#0060CC',
        },
        cyan: {
          300: '#80FFFF',
          400: '#00FFFF',
          500: '#00CCCC',
          600: '#009999',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.4,0,0.2,1)',
        'spin-in':     'spin-in 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'pulse-slow':  'pulse 3s infinite',
      },
    },
  },
  plugins: [],
}