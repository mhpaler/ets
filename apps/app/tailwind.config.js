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
    themes: [
      {
        ets: {
          "primary": "#db2777",
          "primary-content": "#FFFFFF",
          "secondary": "#d6d3d1",
          "accent": "#f9a8d4",
          "neutral": "#44403c",
          "base-100": "#FFFFFF",
          "info": "#93c5fd",
          "success": "#4ade80",
          "warning": "#fcd34d",
          "error": "#ef4444",

          "--btn-text-case": "none",
          //"--rounded-box": "1rem", // border radius rounded-box utility class, used in card and other large boxes
          //"--rounded-btn": "0.5rem", // border radius rounded-btn utility class, used in buttons and similar element
          //"--rounded-badge": "1.9rem", // border radius rounded-badge utility class, used in badges and similar
          //"--animation-btn": "0.25s", // duration of animation when you click on button
          //"--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
          //"--btn-text-case": "uppercase", // set default text transform for buttons
          //"--btn-focus-scale": "0.95", // scale transform of button when you focus on it
          //"--border-btn": "1px", // border width of buttons
          //"--tab-border": "1px", // border width of tabs
          //"--tab-radius": "0.5rem", // border radius of tabs

        },
      }
    ],
    //darkTheme: "dark", // name of one of the included themes for dark mode
    //base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}
