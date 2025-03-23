/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/features/**/*.{js,jsx,ts,tsx}',
  "./public/index.html",],
  theme: {
    extend: {
      fontFamily: {
        agbalumo: ['Agbalumo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },

      colors: {
        bg: '#191919',
		pink: '#F25CAF',
      }
    },
  },
  plugins: [],
}

