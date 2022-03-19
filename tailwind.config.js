module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "hero-bloom":
          "radial-gradient(circle, #e95d1c 4%, #e93e1c 61%, #e91f1c 100%)",
      },
      colors: {
        primary: "#EB4726",
      },
    },
  },
  plugins: [],
};
