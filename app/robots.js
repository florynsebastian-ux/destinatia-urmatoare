export default function robots() {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
