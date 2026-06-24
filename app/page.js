import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, Star, Sparkles, Globe2, BookOpen, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NewsletterCTA from '@/components/newsletter-cta'

async function getArticles(opts = {}) {
  const params = new URLSearchParams(opts).toString()
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles${params ? '?' + params : ''}`
  try {
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return { items: [] }
    return r.json()
  } catch {
    return { items: [] }
  }
}

const CONTINENTS = [
  { name: 'Europa', icon: '🇪🇺', color: 'from-blue-500 to-cyan-500', img: 'https://images.pexels.com/photos/618752/pexels-photo-618752.jpeg' },
  { name: 'Asia', icon: '🌏', color: 'from-pink-500 to-purple-500', img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989' },
  { name: 'America', icon: '🇺🇸', color: 'from-orange-500 to-red-500', img: 'https://images.pexels.com/photos/32479340/pexels-photo-32479340.jpeg' },
  { name: 'Africa', icon: '🌴', color: 'from-amber-500 to-yellow-500', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200' },
]

const TESTIMONIALS = [
  { name: 'Ioana M.', city: 'Cluj-Napoca', text: 'Ghidul de Tokyo m-a salvat – am făcut exact itinerarul recomandat și a fost cea mai bună vacanță.', rating: 5 },
  { name: 'Andrei P.', city: 'București', text: 'Articolele sunt detaliate, cu informații practice și sfaturi pe care nu le găsești nicăieri.', rating: 5 },
  { name: 'Maria T.', city: 'Timișoara', text: 'Recomandările de cazare și restaurante au fost spot on. Mulțumesc pentru pasiune!', rating: 5 },
]

export default async function HomePage() {
  const featured = await getArticles({ featured: 'true', limit: '3' })
  const popular = await getArticles({ limit: '6' })

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.destinatiaurmatoare.eu'

  // ItemList schema for featured articles — Google may show them as carousel in SERP
  const itemListSchema = (featured.items || []).length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Articole recomandate · Destinația Următoare',
    itemListElement: featured.items.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/blog/${a.slug}`,
      name: a.title,
      image: a.cover,
    })),
  } : null

  return (
    <div>
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      {/* HERO */}
      <section className="relative h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=2400&q=80"
            alt="Călătorie"
            fill
            priority
            className="object-cover shimmer"
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Badge className="mb-6 bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/20 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Travel blog #1 în România
          </Badge>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6">
            Lumea te așteaptă.
            <br />
            <span className="italic font-light">Tu unde mergi?</span>
          </h1>
          <p className="text-lg sm:text-xl text-cyan-50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ghiduri detaliate, itinerarii testate și povești din 50+ destinații.
            Inspirație pentru călători curioși.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog">
              <Button size="lg" className="bg-white text-cyan-700 hover:bg-cyan-50 h-14 px-8 text-base rounded-full font-semibold shadow-2xl">
                <Compass className="w-5 h-5 mr-2" />
                Explorează ghidurile
              </Button>
            </Link>
            <Link href="/travel-tips">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20 h-14 px-8 text-base rounded-full font-semibold">
                Travel Tips
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-12 bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-widest">Articole recomandate</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 max-w-2xl">
              Povești care ți-au schimbat felul în care vezi lumea
            </h2>
          </div>
          <Link href="/blog" className="text-cyan-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Toate articolele <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(featured.items || []).map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="group card-hover">
              <article className="bg-white rounded-2xl overflow-hidden border border-slate-100 h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={a.cover} alt={a.title} fill className="object-cover img-zoom" sizes="(max-width: 768px) 100vw, 33vw" />
                  <Badge className="absolute top-4 left-4 bg-white text-cyan-700 hover:bg-white">{a.continent}</Badge>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.country}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.readingMinutes} min</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-cyan-600 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">{a.excerpt}</p>
                  <span className="text-cyan-600 text-sm font-semibold mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Citește ghidul <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* CONTINENTS */}
      <section className="py-24 bg-gradient-to-b from-cyan-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-cyan-600 mb-3">
              <Globe2 className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-widest">Destinații populare</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">
              Alege continentul tău
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTINENTS.map((c) => (
              <Link key={c.name} href={`/blog?continent=${c.name}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden card-hover">
                <Image src={c.img} alt={c.name} fill className="object-cover img-zoom" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                  <span className="text-sm text-cyan-100 flex items-center gap-1 mt-2 opacity-90 group-hover:gap-2 transition-all">
                    Vezi ghidurile <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR ARTICLES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 mb-3">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-widest">Cele mai populare</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Ghiduri citite recent</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(popular.items || []).slice(0, 6).map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="group card-hover">
              <article className="bg-white rounded-2xl overflow-hidden border border-slate-100 h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={a.cover} alt={a.title} fill className="object-cover img-zoom" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50">{a.type}</Badge>
                    <span className="text-xs text-slate-500">{a.country}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors">
                    {a.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Ce spun cititorii</h2>
            <p className="text-slate-600 mt-3 text-lg">Povești reale de la călători reali</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-5 italic">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <div className="py-24">
        <NewsletterCTA />
      </div>
    </div>
  )
}
