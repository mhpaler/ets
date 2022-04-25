module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
