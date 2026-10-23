import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cassannet: ["Cassannet", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        sakura: {
          50: "#fff1f4",
          100: "#ffe4eb",
          200: "#fecdd8",
          300: "#fda4b9",
          400: "#fb7193",
          500: "#f43f6e",
          600: "#e11d59",
          700: "#be1243",
          800: "#9d123b",
          900: "#831435",
          950: "#4c0519",
        },
        surface: {
          light: "#faf8f5",
          cardLight: "#ffffff",
          elevatedLight: "#f3efea",
          dark: "#121216",
          cardDark: "#181820",
          elevatedDark: "#1e1e28",
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
