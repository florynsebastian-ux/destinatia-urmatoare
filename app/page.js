import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, Star, Sparkles, Globe2, BookOpen, Compass, HelpCircle, ChevronDown } from 'lucide-react'
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

// FAQ — plain text answers so Google can extract them for Featured Snippets.
// Each Q must be a real long-tail search query in Romanian.
const FAQS = [
  {
    q: 'Cum îmi planific o vacanță în străinătate cu buget mic?',
    a: 'Începe cu 3 pași: (1) alege destinații low-cost — Balcanii, Portugalia, Polonia sau Sud-Estul Asiei; (2) rezervă zborul cu 6-8 săptămâni înainte, marțea sau miercurea, folosind Skyscanner sau Google Flights; (3) cazează-te în hosteluri, apartamente Airbnb sau prin Booking.com Genius (10-15% discount). Pentru masă, alege piețe locale și meniuri „menu del día" — poți mânca sub 10€/zi în majoritatea țărilor europene. Un city break de 4 zile în Europa costă între 250-450€ de persoană, tot inclus.'
  },
  {
    q: 'Cât costă în medie o vacanță în Europa pentru 2 persoane?',
    a: 'Depinde mult de destinație și sezon. Estimări realiste pentru 5 zile, 2 persoane, în 2026: Praga sau Budapesta 700-900€, Roma sau Barcelona 1.100-1.500€, Paris sau Londra 1.500-2.200€, Amsterdam sau Copenhaga 1.700-2.400€. Include zbor, cazare 3-4*, transport local, atracții principale și 2 mese/zi la restaurant. Poți economisi 30-40% călătorind în afara sezonului (noiembrie-martie, cu excepția Crăciunului).'
  },
  {
    q: 'Ce documente îmi trebuie ca român pentru a călători în afara UE?',
    a: 'Ca cetățean român, ai nevoie de: (1) pașaport valabil minim 6 luni de la data întoarcerii; (2) viză — verifică pe MAE.ro dacă e necesară (SUA, Canada, Australia, majoritatea țărilor asiatice/africane); (3) asigurare medicală internațională (obligatorie pentru Schengen dacă zbori tranzit UE, recomandată oriunde); (4) bilet retur și dovadă de cazare (cerute la vamă în multe țări); (5) 50-100€ cash în valuta locală pentru primele ore. Pentru UE și Schengen, doar cartea de identitate e suficientă.'
  },
  {
    q: 'Care sunt cele mai bune site-uri pentru rezervarea de zboruri ieftine?',
    a: 'Cele mai eficiente 4 platforme testate: (1) Google Flights — cel mai rapid pentru comparație și cu funcția „date flexibile"; (2) Skyscanner — bun pentru rute cu escale; (3) Kiwi.com — cel mai bun pentru combinații neconvenționale (companii low-cost); (4) direct pe site-ul companiei — deseori mai ieftin decât agregatorii. Sfat pro: rezervă marțea seara sau miercurea dimineața, cu 6-8 săptămâni înainte pentru Europa și 3-5 luni pentru zboruri intercontinentale. Curăță cookies între căutări.'
  },
  {
    q: 'Când e cel mai ieftin să rezerv o vacanță?',
    a: 'Regula 6-8-12: rezervă zborul intra-europene cu 6-8 săptămâni înainte, zborurile intercontinentale cu 3-5 luni înainte, iar cazarea cu 4-8 săptămâni înainte (după ce Booking.com scade prețurile prin actualizări automate). Cele mai ieftine luni pentru majoritatea destinațiilor europene: ianuarie, februarie, noiembrie și începutul lunii decembrie. Evită vacanțele școlare (iulie-august, Crăciun, Paști) — prețurile cresc cu 40-70%.'
  },
  {
    q: 'Ce asigurare de călătorie recomandați pentru vacanțele externe?',
    a: 'Pentru UE, cardul european de asigurări de sănătate (EHIC/CEASS) — gratuit de la CNAS — acoperă urgențele medicale de bază. Pentru destinații non-UE sau activități riscante (schi, scuba, hiking peste 3.000m), ia asigurare privată cu acoperire de minim 30.000€ medical + repatriere. Companii recomandate în România: Groupama, Allianz, City Insurance, ERGO. Cost mediu: 15-40€ pentru o săptămână, în funcție de destinație și vârstă.'
  },
  {
    q: 'Cum aleg destinația potrivită pentru primul meu city break?',
    a: 'Pentru primul city break, alege o capitală europeană cu 3 caracteristici: (1) infrastructură prietenoasă cu turiștii — Praga, Budapesta, Viena, Barcelona, Lisabona; (2) transport public simplu de folosit (metrou sau tramvai); (3) atracții principale la distanță de mers pe jos în centrul istoric. Evită pentru început metropolele imense (Londra, Paris — necesită planificare complexă) sau destinațiile fără limba engleză larg vorbită. Durata optimă: 4-5 zile.'
  },
  {
    q: 'Cum evit turiștii aglomerați într-o destinație populară?',
    a: 'Aplică regula 3-3-3: vizitează atracțiile top cu 3 ore înainte de deschiderea oficială pentru turiștii de croazieră (7-9 dimineața), stai 3 zile în oraș ca să prinzi și zonele mai puțin cunoscute, și mergi cu 3 stații de metrou mai departe de centru pentru mese autentice la prețuri normale. În plus: rezervă biletele online în avans (skip-the-line), evită weekendurile pentru muzee și mergi în afara sezonului (aprilie-mai sau septembrie-octombrie).'
  },
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

  // FAQPage schema — CRITICAL for Featured Snippets ("position 0") in Google.
  // Each Q&A pair may show as a rich result under our homepage listing.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${base}/#faq`,
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div>
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
                Sfaturi de călătorie
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

      {/* FAQ — targets Featured Snippets ("position 0") via FAQPage schema + native <details> for zero-JS crawling */}
      <section id="faq" className="py-24 bg-gradient-to-b from-white via-cyan-50/40 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Întrebări frecvente
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Ce vor să știe călătorii români
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Răspunsuri concrete la cele mai căutate întrebări despre planificarea vacanțelor. Fără teorie — doar experiență de teren.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 transition-colors overflow-hidden shadow-sm hover:shadow-md"
              >
                <summary className="cursor-pointer list-none p-6 flex items-start justify-between gap-4 select-none">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <h3 className="font-display font-semibold text-slate-900 text-lg leading-snug pt-0.5">
                      {f.q}
                    </h3>
                  </div>
                  <ChevronDown className="flex-shrink-0 w-5 h-5 text-slate-400 mt-1 transition-transform duration-200 group-open:rotate-180 group-open:text-cyan-600" />
                </summary>
                <div className="px-6 pb-6 pl-[4.5rem] -mt-1">
                  <p className="text-slate-700 leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Nu găsești răspunsul aici?</p>
            <Link href="/contact">
              <Button variant="outline" className="border-cyan-500 text-cyan-700 hover:bg-cyan-50">
                Întreabă-mă direct
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
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
