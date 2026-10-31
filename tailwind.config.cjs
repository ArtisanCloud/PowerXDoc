/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './docs/.vitepress/theme/**/*.{js,ts,vue}',
    './docs/website/**/*.{md,mdx,vue}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
