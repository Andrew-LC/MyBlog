/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cassannet: ["Cassannet", "sans-serif"]
      },
      colors: {
        'dark-mode': '#202023',
        'para': '#b1b1b1',
        'heading': '#eaeaea',
        'heading-light': '#282828',
        'para-light': 'black'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}