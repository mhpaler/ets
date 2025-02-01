const daisyui = require("daisyui");
const typography = require("@tailwindcss/typography");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./layouts/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.slate,
      pink: {
        50: "#fdf2f8",
        100: "#fce7f3",
        200: "#fbcfe8",
        300: "#f9a8d4",
        400: "#f472b6",
        500: "#db2777", // Your primary color
        600: "#c42167",
        700: "#ad1b58",
        800: "#961648",
        900: "#7e1239",
        950: "#660f2f",
      },
      slate: colors.slate,
      teal: colors.teal,
      purple: colors.purple,
    },
    extend: {
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideOut: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out forwards",
        slideOut: "slideOut 0.3s ease-in forwards",
      },
    },
  },

  daisyui: {
    themes: [
      {
        ets: {
          primary: "#db2777",
          secondary: "#fbcfe8",
          accent: "#a8a29e",
          neutral: "#0a071f",
          info: "#00aeff",
          success: "#84e455",
          warning: "#feb100",
          error: "#da4148",
          "base-100": "#ffffff", // white
          "base-200": "#e2e8f0", // slate-200 color value
          "base-300": "#cbd5e1", // slate-300
        },
      },
    ],
    //themes: ["light"],
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },

  plugins: [typography, daisyui],
};
