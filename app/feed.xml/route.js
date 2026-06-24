// RSS 2.0 feed for Destinația Următoare blog
// Crawled by aggregators (Feedly, Inoreader), Google News, and helps with indexing.

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.destinatiaurmatoare.eu'
  let items = []
  try {
    const r = await fetch(`${base}/api/articles?limit=30`, { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      items = d.items || []
    }
  } catch (e) {
    console.error('feed.xml fetch error:', e)
  }

  const lastBuildDate = items[0]?.publishedAt
    ? new Date(items[0].publishedAt).toUTCString()
    : new Date().toUTCString()

  const itemsXml = items
    .map((a) => {
      const pubDate = new Date(a.publishedAt || Date.now()).toUTCString()
      const link = `${base}/blog/${a.slug}`
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.excerpt || '')}</description>
      <category>${escapeXml(a.continent || '')}</category>
      <category>${escapeXml(a.country || '')}</category>
      <category>${escapeXml(a.type || '')}</category>
      ${a.cover ? `<enclosure url="${escapeXml(a.cover)}" type="image/jpeg" />` : ''}
      <author>contact@destinatiaurmatoare.eu (${escapeXml(a.author || 'Destinația Următoare')})</author>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Destinația Următoare · Ghiduri de călătorie</title>
    <link>${base}</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Ghiduri detaliate, itinerarii, sfaturi de travel și destinații inspiraționale pentru următoarea ta aventură.</description>
    <language>ro-RO</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js</generator>
${itemsXml}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
