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
    },
  },
  plugins: [
    require('tailwindcss-font-inter'),
  ],
}
