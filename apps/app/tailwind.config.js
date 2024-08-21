const daisyui = require("daisyui");
const typography = require("@tailwindcss/typography");

module.exports = {
  content: ["./layouts/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "sans-serif"],
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
          "base-100": "#ffffff",
          info: "#00aeff",
          success: "#84e455",
          warning: "#feb100",
          error: "#da4148",
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
