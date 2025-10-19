import http from 'node:http'
import { URL, fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_BASE = process.env.POWERX_DOCS_BASE ?? 'http://localhost:4173'
const MANIFEST_PATH = path.resolve(
  __dirname,
  '../../docs/localization/manifest.json',
)

async function loadManifest() {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8')
  return JSON.parse(raw)
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      const chunks = []
      response.on('data', (chunk) => {
        chunks.push(chunk)
      })
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8')
        resolve({
          statusCode: response.statusCode ?? 0,
          body,
        })
      })
    })
    request.on('error', reject)
  })
}

function extractHtmlLang(html) {
  const match = html.match(/<html[^>]+lang="([^"]+)"/i)
  return match ? match[1] : null
}

function hasChineseUiMarkers(html) {
  return /首页|文档|PowerX\s+是一个/.test(html)
}

function hasDefaultLinks(html) {
  return /href="\/core-concepts\//.test(html)
}

async function main() {
  const manifest = await loadManifest()
  const defaultLocale = manifest.sourceLocale
  const indexUrl = new URL('/', DEFAULT_BASE).toString()

  try {
    const { statusCode, body } = await httpGet(indexUrl)
    const htmlLang = extractHtmlLang(body)
    const localePass = htmlLang === defaultLocale
    const contentPass = hasChineseUiMarkers(body)
    const linkPass = hasDefaultLinks(body)

    const pass = statusCode === 200 && localePass && contentPass && linkPass
    if (pass) {
      console.log(
        `PASS: "/" served ${defaultLocale} content (lang="${htmlLang}").`,
      )
      return
    }

    console.error(
      [
        `FAIL: "/" default locale check`,
        `status=${statusCode}`,
        `lang="${htmlLang ?? 'unknown'}"`,
        `contentZh=${contentPass}`,
        `linksZh=${linkPass}`,
      ].join(' | '),
    )
    process.exitCode = 1
  } catch (error) {
    console.error(`ERROR: Unable to verify default locale at ${indexUrl}`, error)
    process.exitCode = 1
  }
}

await main()
