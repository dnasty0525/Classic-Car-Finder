// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f4f8", // Light grey-blue background
        foreground: "#1e1e1e", // Dark gray text for contrast
        accent: "#0077b6",     // Optional accent color (e.g., button color)
      },
      fontSize: {
        base: "1.1rem", // slightly larger base font
        lg: "1.25rem",
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
