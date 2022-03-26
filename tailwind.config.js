const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "glow": "0px 0px 4px #FF6800"
      },
      backgroundImage: {
        "hero-bloom":
          "radial-gradient(circle, #e95d1c 4%, #e93e1c 61%, #e91f1c 100%)",
      },
      colors: {
        primary: "#FF6800",
        subtle: "#999999",
        lightgray: "#E5E5E5",
        textgray: "#4F4F4F",
        light: "#FAFAFA"
      },
      fontFamily: {
        mono: ['Source Code Pro', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};
