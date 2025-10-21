#!/usr/bin/env ts-node
import http from 'node:http'
import { URL } from 'node:url'
import manifest from '../../docs/website/localization/manifest.json'

const DEFAULT_BASE = process.env.POWERX_DOCS_BASE ?? 'http://localhost:4173'
const DEFAULT_LOCALE = manifest.sourceLocale

type FetchResult = {
  statusCode: number
  body: string
}

function httpGet(url: string): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => {
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

function extractHtmlLang(html: string): string | null {
  const match = html.match(/<html[^>]+lang="([^"]+)"/i)
  return match ? match[1] : null
}

function hasChineseUiMarkers(html: string): boolean {
  return /首页|文档|PowerX\s+是一个/.test(html)
}

function hasDefaultLinks(html: string): boolean {
  return /href="\/core-concepts\//.test(html)
}

async function main() {
  const indexUrl = new URL('/', DEFAULT_BASE).toString()
  try {
    const { statusCode, body } = await httpGet(indexUrl)
    const htmlLang = extractHtmlLang(body)
    const localePass = htmlLang === DEFAULT_LOCALE
    const contentPass = hasChineseUiMarkers(body)
    const linkPass = hasDefaultLinks(body)

    const pass = statusCode === 200 && localePass && contentPass && linkPass
    if (pass) {
      console.log(
        `PASS: "/" served ${DEFAULT_LOCALE} content (lang="${htmlLang}").`,
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
