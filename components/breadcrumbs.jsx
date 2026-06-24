import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Visual breadcrumbs + BreadcrumbList JSON-LD schema.
 * @param {Array<{name:string, href?:string}>} items - last item should NOT have href (current page)
 */
export default function Breadcrumbs({ items = [] }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const all = [{ name: 'Acasă', href: '/' }, ...items]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: `${base}${it.href}` } : {}),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex items-center flex-wrap gap-1">
          {all.map((it, i) => {
            const last = i === all.length - 1
            return (
              <li key={i} className="flex items-center gap-1">
                {i === 0 ? <Home className="w-3.5 h-3.5" /> : null}
                {!last && it.href ? (
                  <Link href={it.href} className="hover:text-cyan-600 transition-colors">{it.name}</Link>
                ) : (
                  <span className="text-slate-700 font-medium">{it.name}</span>
                )}
                {!last && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
