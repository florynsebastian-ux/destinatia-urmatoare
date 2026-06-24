import { DEMO_ARTICLES } from '@/lib/seed-data'

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/blog', priority: 0.9, freq: 'daily' },
    { path: '/travel-tips', priority: 0.7, freq: 'weekly' },
    { path: '/despre', priority: 0.5, freq: 'monthly' },
    { path: '/contact', priority: 0.5, freq: 'monthly' },
    { path: '/politica-confidentialitate', priority: 0.3, freq: 'yearly' },
    { path: '/termeni-conditii', priority: 0.3, freq: 'yearly' },
    { path: '/politica-cookies', priority: 0.3, freq: 'yearly' },
  ].map((p) => ({
    url: `${base}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.freq,
    priority: p.priority,
  }))

  let articles = []
  try {
    const r = await fetch(`${base}/api/articles?limit=200`, { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      articles = (d.items || []).map((a) => ({
        url: `${base}/blog/${a.slug}`,
        lastModified: new Date(a.updatedAt || a.publishedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
        images: [a.cover].filter(Boolean),
      }))
    }
  } catch {
    articles = DEMO_ARTICLES.map((a) => ({
      url: `${base}/blog/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
      images: [a.cover].filter(Boolean),
    }))
  }

  return [...staticPages, ...articles]
}
