/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1F3C',
          light: '#162848',
          dark: '#091528',
        },
        teal: {
          DEFAULT: '#028090',
          light: '#03A3B5',
          dark: '#016070',
        },
        seafoam: {
          DEFAULT: '#02C39A',
          light: '#04DFB0',
          dark: '#019E7B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
