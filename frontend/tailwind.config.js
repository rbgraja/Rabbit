/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { 
      colors:{
        "red":"#ea2e0e",
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}