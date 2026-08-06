import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MapPin, Compass, Globe2, Tag } from 'lucide-react'

/**
 * Contextual internal-linking sections at the end of an article.
 * Boosts SEO (Google loves rich internal linking) + retention.
 */
export default function RelatedSections({ groups = {}, currentArticle }) {
  const sameCountry = groups.sameCountry || []
  const sameType = groups.sameType || []
  const sameContinent = groups.sameContinent || []

  const hasAny = sameCountry.length + sameType.length + sameContinent.length > 0
  if (!hasAny) return null

  const sections = [
    sameCountry.length > 0 && {
      icon: MapPin,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      title: `Alte destinații în ${currentArticle.country}`,
      subtitle: `Explorează mai mult din ${currentArticle.country}`,
      items: sameCountry,
      seeAllHref: `/blog?search=${encodeURIComponent(currentArticle.country || '')}`,
      seeAllLabel: `Toate din ${currentArticle.country}`,
    },
    sameType.length > 0 && {
      icon: Compass,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      title: `Alte ghiduri ${currentArticle.type}`,
      subtitle: 'Alte itinerarii de același stil',
      items: sameType,
      seeAllHref: `/blog?type=${encodeURIComponent(currentArticle.type || '')}`,
      seeAllLabel: `Toate ${currentArticle.type}`,
    },
    sameContinent.length > 0 && {
      icon: Globe2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      title: `Explorează ${currentArticle.continent}`,
      subtitle: 'Alte destinații pe același continent',
      items: sameContinent,
      seeAllHref: `/blog?continent=${encodeURIComponent(currentArticle.continent || '')}`,
      seeAllLabel: `Toate din ${currentArticle.continent}`,
    },
  ].filter(Boolean)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100">
      <div className="mb-10 text-center">
        <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Continuă explorarea</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">
          Descoperă și alte destinații
        </h2>
      </div>

      {sections.map((s, si) => {
        const Icon = s.icon
        return (
          <div key={si} className="mb-14 last:mb-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-slate-900 leading-tight">{s.title}</h3>
                  <p className="text-xs md:text-sm text-slate-500">{s.subtitle}</p>
                </div>
              </div>
              <Link
                href={s.seeAllHref}
                className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 whitespace-nowrap"
              >
                {s.seeAllLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {s.items.slice(0, 4).map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                  <article className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={r.cover}
                        alt={`${r.title} - ${r.city || r.country || ''}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width:768px) 100vw, 25vw"
                        loading="lazy"
                      />
                      {r.type && (
                        <Badge className="absolute top-2.5 left-2.5 bg-white/95 text-slate-900 hover:bg-white text-xs">{r.type}</Badge>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      {r.country && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
                          <MapPin className="w-3 h-3" />
                          <span>{r.country}</span>
                        </div>
                      )}
                      <h4 className="font-display font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug text-base line-clamp-2">
                        {r.title}
                      </h4>
                      {r.excerpt && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 flex-1">{r.excerpt}</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )
      })}

      {/* Popular searches — internal linking bonus */}
      <div className="mt-12 pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Categorii populare:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['City Break', 'Aventură', 'Cultural', 'Romantic', 'Plajă', 'Backpacking'].map((t) => (
            <Link
              key={t}
              href={`/blog?type=${encodeURIComponent(t)}`}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-colors text-slate-600"
            >
              {t}
            </Link>
          ))}
          {['Europa', 'Asia', 'America', 'Africa'].map((c) => (
            <Link
              key={c}
              href={`/blog?continent=${encodeURIComponent(c)}`}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-colors text-slate-600"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
