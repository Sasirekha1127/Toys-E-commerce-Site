/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin project uses "brand" (orange palette)
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // User project candy colors
        candy: {
          pink:   '#ff6b9d',
          yellow: '#ffd93d',
          green:  '#6bcb77',
          blue:   '#4d96ff',
          purple: '#c77dff',
        },
      },
      fontFamily: {
        display: ['Fredoka One', 'cursive'],
        body:    ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        // User shadows
        'toy':        '4px 4px 0px 0px rgba(0,0,0,0.15)',
        'toy-hover':  '6px 6px 0px 0px rgba(0,0,0,0.2)',
        'toy-orange': '4px 4px 0px 0px rgba(234, 88, 12, 0.4)',
        // Admin shadows
        'card':       '0 1px 3px 0 rgba(0,0,0,.06), 0 4px 16px 0 rgba(249,115,22,.07)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,.08), 0 8px 32px 0 rgba(249,115,22,.14)',
        'sidebar':    '4px 0 24px 0 rgba(0,0,0,.06)',
      },
      animation: {
        // User animations
        'bounce-slow': 'bounce 2s infinite',
        'wiggle':      'wiggle 1s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'slide-in':    'slideIn 0.3s ease-out',
        // Admin animations
        'fade-in':     'fadeIn .25s ease-out',
        'slide-up':    'slideUp .3s ease-out',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle:    { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        slideIn:   { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot:  { '0%,100%': { opacity: 1 }, '50%': { opacity: .4 } },
      },
    },
  },
  plugins: [],
}
