const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './docs/.vitepress/**/*.{js,ts,vue}',
    './docs/**/*.{md,mdx,vue}',
    path.resolve(__dirname, '../PowerXAdmin/app/pages/home/intro.vue'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
