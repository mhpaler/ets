module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  //theme: {
  //  extend: {
  //    animation: {
  //      'ets-outer': 'ets-outer 300ms ease-out',
  //      'ets-inner': 'ets-inner 300ms ease-out 1 300ms',
  //      'ets-dot': 'spin 3s linear infinite',
  //    },
  //    keyframes: {
  //      'ets-outer': {
  //        '0%': {
  //          transform: 'rotate(0deg) scale(0)',
  //          transformOrigin: 'center',
  //        },
  //        '100%': {
  //          transform: 'rotate(90deg) scale(1)',
  //          transformOrigin: 'center',
  //        },
  //      },
  //      'ets-inner': {
  //        '0%': {
  //          opacity: 0,
  //          transform: 'rotate(0deg) scale(0)',
  //          transformOrigin: 'center',
  //        },
  //        '100%': {
  //          opacity: 1,
  //          transform: 'rotate(135deg) scale(1)',
  //          transformOrigin: 'center',
  //        },
  //      }
  //    },
  //    fontFamily: {
  //      "sans": ["Helvetica", "Helvetica Neue", "Arial", "ui-sans-serif", "system-ui"],
  //    },
  //    gridTemplateColumns: {
  //      '2': 'repeat(2, minmax(150px, 1fr))',
  //      '3': 'repeat(3, minmax(150px, 1fr))',
  //      '4': 'repeat(4, minmax(150px, 1fr))',
  //      '5': 'repeat(5, minmax(150px, 1fr))',
  //      '6': 'repeat(6, minmax(150px, 1fr))',
  //      '7': 'repeat(7, minmax(150px, 1fr))',
  //      '8': 'repeat(8, minmax(150px, 1fr))',
  //    },
  //  },
  //},
  plugins: [
    require('tailwindcss-font-inter'),
    require("daisyui"),
    //require('@tailwindcss/forms'),
  ],

  daisyui: {
    themes: false, // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}
