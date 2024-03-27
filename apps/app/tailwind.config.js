module.exports = {
  content: ["./layouts/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    //require('@tailwindcss/forms'),
    //require("tailwindcss-font-inter"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],

  daisyui: {
    themes: ["light"],
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },
  theme: {
    extend: {
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
};
