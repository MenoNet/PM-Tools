/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0D',
        redAccent: '#E01E2E',
        slateGray: '#334155', // Adjust slate-gray as needed
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Assuming modern tech font for general use
      }
    },
  },
  plugins: [],
}
