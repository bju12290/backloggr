const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          text: '#0c0d0d',
          background: '#f3f5f6',
          primary: '#628ba7',
          secondary: '#97bad3',
          accent: '#6ba7d1',
        },
        dark: {
          text: '#f2f3f3',
          background: '#090b0c',
          primary: '#58819d',
          secondary: '#2c4f68',
          accent: '#2e6994',
        },
    },
  },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}