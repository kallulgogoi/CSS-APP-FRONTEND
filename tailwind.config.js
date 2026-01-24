/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        tech: {
          bg: "#020617", // Slate 950
          card: "#0f172a", // Slate 900
          primary: "#06b6d4", // Cyan 500
          accent: "#10b981", // Emerald 500
          danger: "#ef4444", // Red 500
          muted: "#64748b", // Slate 500
          border: "#1e293b", // Slate 800
        },
      },
    },
  },
  plugins: [],
};
