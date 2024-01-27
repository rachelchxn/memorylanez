/** @type {import('tailwindcss').Config} */

const {nextui} = require("@nextui-org/react");

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      maxHeight: {
        'carousel': '44rem'
      },
      colors: {
        'photoalbum': '#e3d8cd',
        'bgbeige': '#d4c9be',
        'burnt': '#2b2927',
        'placeholder': '#dbcec1',
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
