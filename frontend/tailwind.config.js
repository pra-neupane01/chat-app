/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#07110f",
          900: "#0c1815",
          850: "#101f1b",
          800: "#132722",
          700: "#1c352f",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
}
