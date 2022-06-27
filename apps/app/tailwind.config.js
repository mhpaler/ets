module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'ets-outer': 'ets-outer 300ms ease-out',
        'ets-inner': 'ets-inner 300ms ease-out 1 300ms',
        'ets-dot': 'spin 3s linear infinite',
      },
      keyframes: {
        'ets-outer': {
          '0%': {
            transform: 'rotate(0deg) scale(0)',
            transformOrigin: 'center',
          },
          '100%': {
            transform: 'rotate(90deg) scale(1)',
            transformOrigin: 'center',
          },
        },
        'ets-inner': {
          '0%': {
            opacity: 0,
            transform: 'rotate(0deg) scale(0)',
            transformOrigin: 'center',
          },
          '100%': {
            opacity: 1,
            transform: 'rotate(135deg) scale(1)',
            transformOrigin: 'center',
          },
        }
      },
      fontFamily: {
        "sans": ["Helvetica", "Helvetica Neue", "Arial", "ui-sans-serif", "system-ui"],
      },
      gridTemplateColumns: {
        '2': 'repeat(2, minmax(150px, 1fr))',
        '3': 'repeat(3, minmax(150px, 1fr))',
        '4': 'repeat(4, minmax(150px, 1fr))',
        '5': 'repeat(5, minmax(150px, 1fr))',
        '6': 'repeat(6, minmax(150px, 1fr))',
        '7': 'repeat(7, minmax(150px, 1fr))',
        '8': 'repeat(8, minmax(150px, 1fr))',
      },
    },
  },
  plugins: [
    require('tailwindcss-font-inter'),
    require('@tailwindcss/forms'),
  ],
}
