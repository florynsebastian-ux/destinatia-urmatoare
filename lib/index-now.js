/**
 * IndexNow client — instantly notifies Bing, Yandex, DuckDuckGo, Seznam, Naver, Yep
 * when a URL is published or updated. Fire-and-forget (never throws).
 *
 * Docs: https://www.indexnow.org/documentation
 *
 * IMPORTANT:
 *  - `INDEXNOW_KEY` must be set in .env (same key that we serve at /<key>.txt)
 *  - `NEXT_PUBLIC_BASE_URL` is the production host
 *  - Google does NOT support IndexNow (they rely on sitemap discovery + GSC)
 */

const ENDPOINT = 'https://api.indexnow.org/indexnow'

const getConfig = () => {
  const key = process.env.INDEXNOW_KEY
  const host = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.destinatiaurmatoare.eu').replace(/\/+$/, '')
  // Extract just the hostname (no protocol) — IndexNow requires bare host in payload
  const bareHost = host.replace(/^https?:\/\//, '')
  return { key, host, bareHost }
}

/**
 * Ping a single URL (or up to 10.000 URLs in one request per IndexNow spec).
 * @param {string|string[]} urlOrUrls  Full URLs (https://...)
 * @returns {Promise<{ok:boolean, status?:number, count:number, error?:string}>}
 */
export async function pingIndexNow(urlOrUrls) {
  const { key, host, bareHost } = getConfig()
  if (!key) return { ok: false, count: 0, error: 'INDEXNOW_KEY missing in env' }

  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls]
  const validUrls = urls
    .filter(Boolean)
    .map((u) => (u.startsWith('http') ? u : `${host}${u.startsWith('/') ? u : '/' + u}`))
    // IndexNow requires all URLs from the same host as the key
    .filter((u) => u.includes(bareHost))
    // Dedupe
    .filter((u, i, a) => a.indexOf(u) === i)

  if (validUrls.length === 0) return { ok: false, count: 0, error: 'No valid URLs' }

  const payload = {
    host: bareHost,
    key,
    keyLocation: `${host}/api/indexnow-key`,
    urlList: validUrls,
  }

  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      // Never let this block the request lifecycle for too long
      signal: AbortSignal.timeout(5000),
    })
    // 200/202 = accepted, 422 = URL not from same host, 429 = rate limit
    return { ok: r.ok, status: r.status, count: validUrls.length }
  } catch (e) {
    return { ok: false, count: validUrls.length, error: String(e.message || e).slice(0, 200) }
  }
}

/**
 * Fire-and-forget wrapper — used from route handlers so we don't block the response.
 * Logs errors but never throws.
 */
export function pingIndexNowAsync(urlOrUrls) {
  pingIndexNow(urlOrUrls)
    .then((res) => {
      if (res.ok) console.log(`[IndexNow] ✅ pinged ${res.count} URL(s)`)
      else console.warn(`[IndexNow] ⚠️  ${res.error || `status ${res.status}`} (${res.count} URLs)`)
    })
    .catch((e) => console.error('[IndexNow] error:', e.message))
}
