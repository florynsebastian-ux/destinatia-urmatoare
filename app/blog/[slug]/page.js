import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, MapPin, Calendar, User, ArrowRight, Wallet, Plane, Bed, Camera, Utensils, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import NewsletterCTA from '@/components/newsletter-cta'
import ArticleClient from './article-client'
import WeatherWidget from '@/components/weather-widget'
import Breadcrumbs from '@/components/breadcrumbs'

async function getArticle(slug) {
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/by-slug/${slug}`, { cache: 'no-store' })
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data?.article) return { title: 'Articol' }
  const a = data.article
  const url = `/blog/${a.slug}`
  return {
    title: a.title,
    description: a.excerpt,
    keywords: [...(a.tags || []), a.country, a.city, a.continent, a.type, 'travel blog', 'ghid'].filter(Boolean),
    authors: [{ name: a.author || 'Andrei Munteanu' }],
    openGraph: {
      title: a.title,
      description: a.excerpt,
      images: [{ url: a.cover, width: 1600, height: 1000, alt: a.title }],
      type: 'article',
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt || a.publishedAt,
      authors: [a.author],
      tags: a.tags || [],
      section: a.continent,
      locale: 'ro_RO',
      url,
    },
    twitter: { card: 'summary_large_image', title: a.title, description: a.excerpt, images: [a.cover] },
    alternates: { canonical: url },
    other: {
      'article:published_time': a.publishedAt,
      'article:modified_time': a.updatedAt || a.publishedAt,
      'article:author': a.author || 'Andrei Munteanu',
      'article:section': a.continent || '',
      // Pinterest description for the "Pin it" button
      'pinterest:description': a.excerpt,
      'pinterest:media': a.cover,
    },
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data?.article) return notFound()
  const a = data.article
  const related = data.related || []
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.destinatiaurmatoare.eu'
  const articleUrl = `${base}/blog/${a.slug}`

  // Approximate word count for SEO (Google likes wordCount on Articles)
  const wordCount =
    (a.intro || '').split(/\s+/).length +
    (a.whenToVisit || '').split(/\s+/).length +
    (a.budget || '').split(/\s+/).length +
    (a.transport || '').split(/\s+/).length +
    (a.accommodation || '').split(/\s+/).length +
    (a.attractions || []).reduce((s, x) => s + (x.description || '').split(/\s+/).length, 0) +
    (a.restaurants || []).reduce((s, x) => s + (x.description || '').split(/\s+/).length, 0) +
    (a.tips || []).reduce((s, t) => s + String(t).split(/\s+/).length, 0)

  // Schema.org Article (richer)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: a.title,
    description: a.excerpt,
    image: [a.cover, ...(a.gallery || [])].filter(Boolean),
    datePublished: a.publishedAt,
    dateModified: a.updatedAt || a.publishedAt,
    author: { '@type': 'Person', '@id': `${base}/#author`, name: a.author || 'Andrei Munteanu', url: `${base}/despre` },
    publisher: { '@id': `${base}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    inLanguage: 'ro-RO',
    articleSection: a.continent,
    keywords: (a.tags || []).join(', '),
    wordCount,
    timeRequired: `PT${a.readingMinutes || 8}M`,
    about: a.country ? { '@type': 'Place', name: `${a.city || ''}${a.city ? ', ' : ''}${a.country}` } : undefined,
  }

  // FAQ Schema — extracted from tips (huge SEO win, appears in "People also ask")
  const faqItems = []
  if (a.whenToVisit) {
    faqItems.push({
      '@type': 'Question',
      name: `Când este cel mai bun moment pentru a vizita ${a.city || a.country}?`,
      acceptedAnswer: { '@type': 'Answer', text: a.whenToVisit },
    })
  }
  if (a.budget) {
    faqItems.push({
      '@type': 'Question',
      name: `Cât costă o vacanță în ${a.city || a.country}?`,
      acceptedAnswer: { '@type': 'Answer', text: a.budget },
    })
  }
  if (a.transport) {
    faqItems.push({
      '@type': 'Question',
      name: `Cum ajungi în ${a.city || a.country} și cum te deplasezi?`,
      acceptedAnswer: { '@type': 'Answer', text: a.transport },
    })
  }
  if (a.accommodation) {
    faqItems.push({
      '@type': 'Question',
      name: `Unde să te cazezi în ${a.city || a.country}?`,
      acceptedAnswer: { '@type': 'Answer', text: a.accommodation },
    })
  }
  const faqSchema = faqItems.length >= 2 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  } : null

  // TouristDestination schema if we have country/city
  const placeSchema = a.country ? {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${a.city || a.country}${a.city ? `, ${a.country}` : ''}`,
    description: a.excerpt,
    image: a.cover,
    touristType: a.type,
  } : null

  const sections = [
    { id: 'introducere', label: 'Introducere', has: !!a.intro },
    { id: 'cand-sa-vizitezi', label: 'Când să vizitezi', has: !!a.whenToVisit },
    { id: 'buget', label: 'Buget estimativ', has: !!a.budget },
    { id: 'transport', label: 'Transport', has: !!a.transport },
    { id: 'cazare', label: 'Cazare', has: !!a.accommodation },
    { id: 'obiective', label: 'Obiective turistice', has: a.attractions?.length > 0 },
    { id: 'restaurante', label: 'Restaurante', has: a.restaurants?.length > 0 },
    { id: 'sfaturi', label: 'Sfaturi utile', has: a.tips?.length > 0 },
    { id: 'galerie', label: 'Galerie foto', has: a.gallery?.length > 0 },
  ].filter((s) => s.has)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {placeSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }} />}

      {/* HERO */}
      <section className="relative h-[80vh] min-h-[500px] flex items-end">
        <Image src={a.cover} alt={`${a.title} - ${a.city || a.country}`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-white w-full">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge className="bg-white/15 backdrop-blur border-white/30 text-white">{a.continent}</Badge>
            <Badge className="bg-cyan-500 hover:bg-cyan-500">{a.type}</Badge>
            <span className="flex items-center gap-1 text-sm text-white/90"><MapPin className="w-3 h-3" />{a.country}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mb-4">
            {a.title}
          </h1>
          <p className="text-cyan-50 text-lg max-w-2xl mb-6 leading-relaxed">{a.excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{a.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(a.publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{a.readingMinutes} min citire</span>
          </div>
        </div>
      </section>

      {/* CONTENT + TOC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { name: 'Blog', href: '/blog' },
          { name: a.continent, href: `/blog?continent=${encodeURIComponent(a.continent)}` },
          { name: a.country, href: `/blog?search=${encodeURIComponent(a.country)}` },
          { name: a.title },
        ]} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* TOC */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Cuprins</h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-slate-600 hover:text-cyan-600 py-1.5 border-l-2 border-slate-100 hover:border-cyan-500 pl-3 transition-colors">
                    {s.label}
                  </a>
                ))}
              </nav>
              <ShareButtons title={a.title} />
            </div>
          </aside>

          {/* ARTICLE BODY */}
          <article className="lg:col-span-9 order-1 lg:order-2 prose-travel max-w-none">
            {a.intro && (
              <section id="introducere">
                {a.intro.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                <WeatherWidget city={a.city} country={a.country} />
              </section>
            )}

            {a.whenToVisit && (
              <section id="cand-sa-vizitezi">
                <h2 className="flex items-center gap-3"><Calendar className="w-7 h-7 text-cyan-600" />Când să vizitezi</h2>
                <p>{a.whenToVisit}</p>
              </section>
            )}

            {a.budget && (
              <section id="buget">
                <h2 className="flex items-center gap-3"><Wallet className="w-7 h-7 text-cyan-600" />Buget estimativ</h2>
                <p>{a.budget}</p>
              </section>
            )}

            {a.transport && (
              <section id="transport">
                <h2 className="flex items-center gap-3"><Plane className="w-7 h-7 text-cyan-600" />Transport</h2>
                <p>{a.transport}</p>
              </section>
            )}

            {a.accommodation && (
              <section id="cazare">
                <h2 className="flex items-center gap-3"><Bed className="w-7 h-7 text-cyan-600" />Cazare recomandată</h2>
                <p>{a.accommodation}</p>
              </section>
            )}

            {a.attractions?.length > 0 && (
              <section id="obiective">
                <h2 className="flex items-center gap-3"><Camera className="w-7 h-7 text-cyan-600" />Obiective turistice</h2>
                <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                  {a.attractions.map((att, i) => (
                    <div key={i} className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-5">
                      <h3 className="font-display font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                        {att.name}
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{att.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {a.restaurants?.length > 0 && (
              <section id="restaurante">
                <h2 className="flex items-center gap-3"><Utensils className="w-7 h-7 text-cyan-600" />Restaurante recomandate</h2>
                <div className="not-prose space-y-3 my-6">
                  {a.restaurants.map((r, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-cyan-300 transition-colors">
                      <h3 className="font-display font-bold text-slate-900 text-lg mb-1">🍴 {r.name}</h3>
                      <p className="text-slate-600 text-sm">{r.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {a.tips?.length > 0 && (
              <section id="sfaturi">
                <h2 className="flex items-center gap-3"><Lightbulb className="w-7 h-7 text-cyan-600" />Sfaturi utile</h2>
                <ul className="not-prose space-y-3 my-6">
                  {a.tips.map((t, i) => (
                    <li key={i} className="flex gap-3 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                      <span className="text-amber-500 flex-shrink-0 mt-0.5">💡</span>
                      <span className="text-slate-700 leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {a.gallery?.length > 0 && (
              <section id="galerie">
                <h2 className="flex items-center gap-3"><Camera className="w-7 h-7 text-cyan-600" />Galerie foto</h2>
                <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
                  {a.gallery.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <Image
                        src={img}
                        alt={`${a.city || a.country} - ${a.title} - imagine ${i + 1}`}
                        fill
                        loading="lazy"
                        className="object-cover img-zoom"
                        sizes="(max-width:768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Visible FAQ section (boosts the FAQPage schema effectiveness) */}
            {faqItems.length >= 2 && (
              <section id="intrebari-frecvente" className="mt-12">
                <h2 className="flex items-center gap-3"><Lightbulb className="w-7 h-7 text-cyan-600" />Întrebări frecvente</h2>
                <div className="not-prose space-y-4 my-6">
                  {faqItems.map((q, i) => (
                    <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 group">
                      <summary className="font-display font-bold text-slate-900 text-base cursor-pointer list-none flex items-center justify-between gap-3">
                        <span>{q.name}</span>
                        <span className="text-cyan-500 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                      </summary>
                      <p className="text-slate-700 text-sm leading-relaxed mt-3">{q.acceptedAnswer.text}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {a.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-100">
                {a.tags.map((t) => (
                  <Link key={t} href={`/blog?search=${encodeURIComponent(t)}`} className="px-3 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 rounded-full text-xs font-medium text-slate-700 transition-colors">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            <ArticleClient slug={a.slug} />
          </article>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100">
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Articole similare</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group card-hover">
                <article className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                  <div className="relative aspect-[16/10]">
                    <Image src={r.cover} alt={r.title} fill className="object-cover img-zoom" sizes="33vw" />
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50 mb-2">{r.type}</Badge>
                    <h3 className="font-display font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug">{r.title}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="py-16">
        <NewsletterCTA />
      </div>
    </>
  )
}

function ShareButtons({ title }) {
  // Server-rendered share links
  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Distribuie</h3>
      <div className="flex gap-2">
        {['facebook', 'twitter', 'whatsapp', 'email'].map((p) => (
          <a key={p} href={`/#share-${p}`} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-cyan-500 hover:text-white flex items-center justify-center text-xs font-bold transition-colors uppercase">
            {p[0]}
          </a>
        ))}
      </div>
    </div>
  )
}
