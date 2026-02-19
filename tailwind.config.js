/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        loadingbar: {
          "0%": { transform: "translateX(-60%)" },
          "50%": { transform: "translateX(20%)" },
          "100%": { transform: "translateX(140%)" },
        },
      },
      animation: {
        loadingbar: "loadingbar 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
