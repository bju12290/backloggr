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
           textcontrast: '#777777',
           background: '#F5FAF9',
           primary: '#B7B7B7',
           secondary: '#8F9191',
           tertiary: '#6C7894',
           accent: '#14FFEB',
           warning: '#ff4545',
         },
         dark: {
           text: '#BAE0FC',
           textcontrast: '#777777',
           background: '#1F1F1F',
           primary: '#393939',
           secondary: '#242832',
           tertiary: '#2F3136',
           accent: '#14FFEB',
        },
        // light: {
        //   text: '#0f110e',
        //   background: '#edefeb',
        //   primary: '#3f4738',
        //   secondary: '#a1b5ac',
        //   accent: '#698682',
        // },
        // dark: {
        //   text: '#eff1ee',
        //   background: '#11130f',
        //   primary: '#bec7b7',
        //   secondary: '#4a5f56',
        //   accent: '#779591',
        // },
    },
  },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}