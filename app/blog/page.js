'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, MapPin, Clock, Filter, X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function BlogContent() {
  const router = useRouter()
  const sp = useSearchParams()

  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ continents: [], countries: [], types: [] })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(parseInt(sp.get('page') || '1', 10))
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState(sp.get('search') || '')
  const [continent, setContinent] = useState(sp.get('continent') || 'all')
  const [country, setCountry] = useState(sp.get('country') || 'all')
  const [type, setType] = useState(sp.get('type') || 'all')

  useEffect(() => {
    fetch('/api/articles/meta').then((r) => r.json()).then(setMeta)
  }, [])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (search) qs.set('search', search)
    if (continent !== 'all') qs.set('continent', continent)
    if (country !== 'all') qs.set('country', country)
    if (type !== 'all') qs.set('type', type)
    qs.set('page', String(page))
    qs.set('limit', '9')

    fetch('/api/articles?' + qs.toString())
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setPages(d.pages || 1)
        setTotal(d.total || 0)
        setLoading(false)
      })

    // Update URL
    const urlParams = new URLSearchParams()
    if (search) urlParams.set('search', search)
    if (continent !== 'all') urlParams.set('continent', continent)
    if (country !== 'all') urlParams.set('country', country)
    if (type !== 'all') urlParams.set('type', type)
    if (page > 1) urlParams.set('page', String(page))
    const url = urlParams.toString() ? '/blog?' + urlParams.toString() : '/blog'
    router.replace(url, { scroll: false })
  }, [search, continent, country, type, page, router])

  const reset = () => {
    setSearch('')
    setContinent('all')
    setCountry('all')
    setType('all')
    setPage(1)
  }

  const hasFilter = search || continent !== 'all' || country !== 'all' || type !== 'all'

  return (
    <div className="pt-32 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <div className="inline-block bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
          Travel Guides
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 mb-4">
          Toate ghidurile noastre
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Caută după destinație, continent sau tip de călătorie. Toate poveștile tale viitoare încep aici.
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Caută după oraș, țară, tag..."
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value) }}
                className="pl-10 h-11"
              />
            </div>
            <Select value={continent} onValueChange={(v) => { setPage(1); setContinent(v) }}>
              <SelectTrigger className="h-11 md:col-span-2"><SelectValue placeholder="Continent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate continentele</SelectItem>
                {meta.continents.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={(v) => { setPage(1); setCountry(v) }}>
              <SelectTrigger className="h-11 md:col-span-3"><SelectValue placeholder="Țară" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate țările</SelectItem>
                {meta.countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => { setPage(1); setType(v) }}>
              <SelectTrigger className="h-11 md:col-span-2"><SelectValue placeholder="Tip" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate tipurile</SelectItem>
                {meta.types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilter && (
              <Button variant="ghost" onClick={reset} className="h-11 md:col-span-1">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-slate-500 mt-4">
          {loading ? 'Se încarcă...' : `${total} ghiduri găsite`}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="font-display text-2xl font-bold text-slate-900">Niciun ghid găsit</h3>
            <p className="text-slate-500 mt-2">Încearcă alți termeni de căutare sau resetează filtrele.</p>
            <Button onClick={reset} className="mt-6 bg-cyan-500 hover:bg-cyan-600">Resetează filtrele</Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="group card-hover">
              <article className="bg-white rounded-2xl overflow-hidden border border-slate-100 h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={a.cover} alt={a.title} fill className="object-cover img-zoom" sizes="(max-width: 768px) 100vw, 33vw" />
                  <Badge className="absolute top-3 left-3 bg-white text-cyan-700 hover:bg-white">{a.continent}</Badge>
                  {a.featured && (
                    <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-500">✨ Recomandat</Badge>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.country}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.readingMinutes} min</span>
                    <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50">{a.type}</Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-cyan-600 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">{a.excerpt}</p>
                  <span className="text-cyan-600 text-sm font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Citește ghidul <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pages }).map((_, i) => (
              <Button
                key={i}
                size="icon"
                variant={page === i + 1 ? 'default' : 'outline'}
                className={page === i + 1 ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" disabled={page === pages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Se încarcă...</div>}>
      <BlogContent />
    </Suspense>
  )
}
