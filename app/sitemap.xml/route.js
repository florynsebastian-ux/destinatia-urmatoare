// Custom sitemap.xml route — explicit Content-Type with charset, image sitemap inline.
// Replaces the default Next.js sitemap.js so we can control headers precisely.
// Google Search Console accepts this only if Content-Type is exactly application/xml or text/xml.

import { DEMO_ARTICLES } from '@/lib/seed-data'

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.destinatiaurmatoare.eu').replace(/\/$/, '')

  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/blog', priority: 0.9, freq: 'daily' },
    { path: '/travel-tips', priority: 0.7, freq: 'weekly' },
    { path: '/despre', priority: 0.5, freq: 'monthly' },
    { path: '/contact', priority: 0.5, freq: 'monthly' },
    { path: '/politica-confidentialitate', priority: 0.3, freq: 'yearly' },
    { path: '/termeni-si-conditii', priority: 0.3, freq: 'yearly' },
    { path: '/politica-cookies', priority: 0.3, freq: 'yearly' },
  ]

  let articles = []
  try {
    const r = await fetch(`${base}/api/articles?limit=200`, { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      articles = d.items || []
    }
  } catch (e) {
    console.error('sitemap fetch error:', e)
    articles = DEMO_ARTICLES
  }

  const now = new Date().toISOString()

  const staticUrls = staticPages
    .map(
      (p) => `  <url>
    <loc>${base}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n')

  const articleUrls = articles
    .map((a) => {
      const lastmod = new Date(a.updatedAt || a.publishedAt || Date.now()).toISOString()
      const imagesXml = [a.cover, ...(a.gallery || [])]
        .filter(Boolean)
        .slice(0, 5) // limit to 5 images per URL
        .map(
          (img) => `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(a.title)}</image:title>
      <image:caption>${escapeXml(a.excerpt || a.title)}</image:caption>
    </image:image>`
        )
        .join('\n')

      return `  <url>
    <loc>${base}/blog/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${imagesXml}
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${articleUrls}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex', // sitemap itself should not be indexed
    },
  })
}
