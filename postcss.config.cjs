const { existsSync } = require('fs')
const path = require('path')

const searchPaths = require.main?.paths ?? module.paths
const plugins = []

const hasPackage = (pkgName) =>
  searchPaths.some((basePath) =>
    existsSync(path.join(basePath, pkgName, 'package.json')),
  )

const isCi = /^true$/i.test(process.env.CI ?? '') || process.env.CI === '1'

if (hasPackage('tailwindcss')) {
  const tailwindcss = require('tailwindcss')
  plugins.push(tailwindcss())
} else if (!isCi) {
  console.warn('[postcss] tailwindcss not installed; skipping plugin during build.')
}

if (hasPackage('autoprefixer')) {
  const autoprefixer = require('autoprefixer')
  plugins.push(autoprefixer())
} else if (!isCi) {
  console.warn('[postcss] autoprefixer not installed; skipping plugin during build.')
}

module.exports = {
  plugins,
}
