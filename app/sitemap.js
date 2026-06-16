import { DEMO_ARTICLES } from '@/lib/seed-data'

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const staticPages = ['', '/blog', '/travel-tips', '/despre', '/contact'].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1.0 : 0.7,
  }))

  let articles = []
  try {
    const r = await fetch(`${base}/api/articles?limit=100`, { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      articles = (d.items || []).map((a) => ({
        url: `${base}/blog/${a.slug}`,
        lastModified: new Date(a.updatedAt || a.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      }))
    }
  } catch {
    articles = DEMO_ARTICLES.map((a) => ({
      url: `${base}/blog/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
  }

  return [...staticPages, ...articles]
}
