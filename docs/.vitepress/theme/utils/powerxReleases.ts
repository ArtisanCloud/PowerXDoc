// Public release list includes prereleases; /releases/latest does not.
// https://docs.github.com/en/rest/releases/releases#list-releases
export const POWERX_RELEASES_API = 'https://api.github.com/repos/ArtisanCloud/PowerX/releases'
export const POWERX_RELEASES_URL = 'https://github.com/ArtisanCloud/PowerX/releases'
const PAGE_SIZE = 100
const MAX_PAGES = 10

export interface PowerXRelease {
  tag: string
  publishedAt: string
  prerelease: boolean
  url: string
  cloneCommand: string
}

export class ReleaseLookupError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'ReleaseLookupError'
  }
}

function invalidResponse(): never {
  throw new ReleaseLookupError('response', 'GitHub 返回的发布信息不完整，暂时无法确认最新版本。')
}

function validTag(tag: unknown): tag is string {
  // Git ref restrictions, plus an explicit option boundary. Shell quoting below
  // also preserves legitimate tags containing $, quotes or other shell syntax.
  return typeof tag === 'string' && tag.length > 0 &&
    !tag.startsWith('-') && !tag.startsWith('/') && !tag.endsWith('/') &&
    !tag.endsWith('.') && !tag.endsWith('.lock') &&
    !Array.from(tag).some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || '~^:?*[\\'.includes(char)) &&
    !tag.includes('..') && !tag.includes('@{') &&
    !tag.split('/').some(part => !part || part.startsWith('.') || part.endsWith('.lock'))
}

export function selectLatestContainerRelease(records: unknown[]): PowerXRelease {
  const candidates: { value: PowerXRelease; timestamp: number; id: number }[] = []
  for (const entry of records) {
    if (!entry || typeof entry !== 'object') invalidResponse()
    const record = entry as Record<string, any>
    if (record.draft === true) continue
    if (record.draft !== false || !Array.isArray(record.assets)) invalidResponse()
    const available = (name: string) => record.assets.some((asset: any) =>
      asset?.name === name && asset.state === 'uploaded' && Number.isFinite(asset.size) && asset.size > 0)
    // Do not constrain the tag prefix: future stable vX.Y.Z releases qualify too.
    if (!available('powerx-docker.tar.gz') || !available('powerx-docker.tar.gz.sha256')) continue
    if (!validTag(record.tag_name) || typeof record.prerelease !== 'boolean' ||
      typeof record.published_at !== 'string' || !Number.isFinite(Date.parse(record.published_at))) invalidResponse()
    const tag = record.tag_name
    const quotedTag = `'${tag.replace(/'/g, "'\\''")}'`
    candidates.push({
      timestamp: Date.parse(record.published_at),
      id: Number.isSafeInteger(record.id) ? record.id : 0,
      value: {
        tag,
        publishedAt: new Date(record.published_at).toISOString(),
        prerelease: record.prerelease,
        url: `${POWERX_RELEASES_URL}/tag/${encodeURIComponent(tag)}`,
        cloneCommand: `git clone --depth 1 --branch ${quotedTag} https://github.com/ArtisanCloud/PowerX.git ~/powerx-local`,
      },
    })
  }
  candidates.sort((a, b) => b.timestamp - a.timestamp || b.id - a.id)
  if (!candidates.length) {
    throw new ReleaseLookupError('empty', '未找到含完整容器包和校验文件的已发布版本，暂时无法生成命令。')
  }
  return candidates[0].value
}

export async function fetchLatestPowerXRelease({
  fetchImpl = globalThis.fetch,
  signal,
  maxPages = MAX_PAGES,
}: { fetchImpl?: typeof fetch; signal?: AbortSignal; maxPages?: number } = {}): Promise<PowerXRelease> {
  const records: unknown[] = []
  for (let page = 1; page <= maxPages; page++) {
    signal?.throwIfAborted()
    const response = await fetchImpl(`${POWERX_RELEASES_API}?per_page=${PAGE_SIZE}&page=${page}`, {
      headers: { Accept: 'application/vnd.github+json' },
      credentials: 'omit',
      cache: 'no-store',
      signal,
    })
    if (!response.ok) {
      let rateMessage = ''
      if (response.status === 403) {
        try { rateMessage = String((await response.json())?.message || '') } catch { /* HTTP status remains authoritative. */ }
      }
      if (response.status === 429 || (response.status === 403 &&
        (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after') || /rate limit|abuse detection/i.test(rateMessage)))) {
        throw new ReleaseLookupError('rate-limit', 'GitHub 请求额度暂时用完，请稍后重新获取，或打开官方 Releases。')
      }
      throw new ReleaseLookupError('http', `GitHub 请求失败（HTTP ${response.status}），暂时无法确认最新版本。`)
    }
    let batch: unknown
    try { batch = await response.json() } catch { invalidResponse() }
    signal?.throwIfAborted()
    if (!Array.isArray(batch)) invalidResponse()
    records.push(...batch)
    // Follow all pages, even after finding a candidate: API order is not a
    // guarantee of published_at order. Missing Link falls back conservatively
    // to a full-page check. Never label a truncated history as "latest".
    const link = response.headers.get('link')
    const hasNext = link
      ? /<[^>]+>;\s*rel="next"/.test(link)
      : batch.length === PAGE_SIZE
    if (!hasNext) return selectLatestContainerRelease(records)
  }
  throw new ReleaseLookupError('pagination', '发布记录过多，暂时无法确认最新版本；请打开官方 Releases 选择版本。')
}
