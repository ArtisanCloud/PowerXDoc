import { performance } from 'node:perf_hooks'
import { URL } from 'node:url'
import http from 'node:http'

const DEFAULT_BASE = process.env.POWERX_DOCS_BASE ?? 'http://localhost:4173'
const TARGET_ROUTES = ['/core-concepts/', '/guides/', '/api-and-specifications/']
const THRESHOLD_MS = 2000

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      response.on('data', () => {})
      response.on('end', resolve)
    })
    request.on('error', reject)
  })
}

async function measure(route) {
  const zhUrl = new URL(route, DEFAULT_BASE).toString()
  const enUrl = new URL(`/en${route === '/' ? '/' : route}`, DEFAULT_BASE).toString()

  const startZh = performance.now()
  await httpGet(zhUrl)
  const durationZh = performance.now() - startZh

  const startEn = performance.now()
  await httpGet(enUrl)
  const durationEn = performance.now() - startEn

  return {
    route,
    zh: durationZh,
    en: durationEn,
    pass: durationEn <= THRESHOLD_MS,
  }
}

const results = []
for (const route of TARGET_ROUTES) {
  try {
    const result = await measure(route)
    results.push(result)
    const status = result.pass ? 'PASS' : 'FAIL'
    console.log(`${status}: ${route} zh ${result.zh.toFixed(0)}ms | en ${result.en.toFixed(0)}ms`)
  } catch (error) {
    console.error(`ERROR: Unable to measure ${route}`, error)
  }
}

const failures = results.filter((result) => !result.pass)
if (failures.length > 0) {
  process.exitCode = 1
}
