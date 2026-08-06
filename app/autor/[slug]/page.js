import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Mail, Award, Globe2, Calendar, ArrowRight, Instagram, Facebook, Youtube, Twitter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getAuthorBySlug } from '@/lib/authors'

async function getAuthorArticles(authorName) {
  try {
    // Fetch first 100 articles then filter server-side.
    // (Simpler than adding a new API endpoint; count of articles per author is small.)
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/articles?limit=100`, { cache: 'no-store' })
    if (!r.ok) return []
    const d = await r.json()
    return (d.items || []).filter(a => String(a.author || '').toLowerCase().includes(authorName.toLowerCase()))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) return { title: 'Autor negăsit' }
  return {
    title: `${author.name} · Travel Blogger`,
    description: author.bio,
    alternates: { canonical: `/autor/${author.slug}` },
    openGraph: {
      title: `${author.name} - ${author.jobTitle}`,
      description: author.bio,
      images: [author.avatar],
      type: 'profile',
      url: `/autor/${author.slug}`,
    },
  }
}

export default async function AuthorPage({ params }) {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) return notFound()

  const articles = await getAuthorArticles(author.name)
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.destinatiaurmatoare.eu'

  // Compute stats from articles
  const uniqueCountries = new Set(articles.map(a => a.country).filter(Boolean))
  const uniqueContinents = new Set(articles.map(a => a.continent).filter(Boolean))

  // Rich Person schema (E-E-A-T boost)
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${base}/autor/${author.slug}#person`,
    name: author.name,
    url: `${base}/autor/${author.slug}`,
    image: author.avatar,
    jobTitle: author.jobTitle,
    description: author.bio,
    email: author.email,
    address: { '@type': 'PostalAddress', addressLocality: author.location },
    worksFor: { '@id': `${base}/#organization` },
    knowsAbout: author.expertise,
    sameAs: Object.values(author.social).filter(Boolean),
  }

  // ProfilePage schema
  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: { '@id': `${base}/autor/${author.slug}#person` },
    dateCreated: '2025-01-01',
    dateModified: new Date().toISOString().slice(0, 10),
    inLanguage: 'ro-RO',
  }

  const socials = [
    { url: author.social.instagram, Icon: Instagram, label: 'Instagram' },
    { url: author.social.facebook, Icon: Facebook, label: 'Facebook' },
    { url: author.social.youtube, Icon: Youtube, label: 'YouTube' },
    { url: author.social.twitter, Icon: Twitter, label: 'Twitter' },
  ].filter(s => s.url)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-16 pb-24 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 order-2 md:order-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Cunoaște autorul</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mt-3 mb-4 leading-tight">
                Salut, sunt <span className="gradient-text">{author.displayName}</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">{author.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" />{author.jobTitle}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" />{author.location}</span>
                <a href={`mailto:${author.email}`} className="flex items-center gap-1.5 hover:text-cyan-600 transition-colors">
                  <Mail className="w-4 h-4 text-cyan-600" />{author.email}
                </a>
              </div>

              {socials.length > 0 && (
                <div className="flex gap-3">
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="me noopener noreferrer"
                      aria-label={s.label}
                      className="w-11 h-11 rounded-full bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 flex items-center justify-center transition-colors"
                    >
                      <s.Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2 order-1 md:order-2">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image src={author.avatar} alt={author.name} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 40vw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 grid grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: Calendar, val: author.stats.years, label: 'Ani de călătorii', color: 'text-cyan-600 bg-cyan-50' },
            { icon: Globe2, val: uniqueCountries.size || author.stats.countries, label: 'Țări vizitate', color: 'text-amber-600 bg-amber-50' },
            { icon: Award, val: articles.length || 0, label: 'Ghiduri publicate', color: 'text-emerald-600 bg-emerald-50' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="text-center">
                <div className={`w-14 h-14 mx-auto rounded-2xl ${s.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-slate-900">{s.val}</div>
                <div className="text-xs md:text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
          Domenii de expertiză
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {author.expertise.map((e, i) => (
            <Badge key={i} className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 text-sm py-2 px-4 border-0">
              ✓ {e}
            </Badge>
          ))}
        </div>
      </section>

      {/* ARTICLES */}
      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-slate-100">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Portofoliu</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              Toate ghidurile scrise de {author.displayName}
            </h2>
            <p className="text-slate-500 mt-2">{articles.length} articole publicate în {uniqueContinents.size} continente</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                <article className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-cyan-200 hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={r.cover} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" loading="lazy" />
                    {r.type && <Badge className="absolute top-3 left-3 bg-white/95 text-slate-900 text-xs">{r.type}</Badge>}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <MapPin className="w-3 h-3" />{r.country}
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug line-clamp-2">{r.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3 flex-1">{r.excerpt}</p>
                    <div className="mt-3 text-cyan-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Citește ghidul <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
