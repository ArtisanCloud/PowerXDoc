const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './docs/.vitepress/**/*.{js,ts,vue}',
    './docs/**/*.{md,mdx,vue}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
