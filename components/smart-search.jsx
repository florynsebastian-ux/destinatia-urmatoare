'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, X, MapPin, ArrowRight } from 'lucide-react'

export default function SmartSearch({ variant = 'header' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/articles?search=${encodeURIComponent(query)}&limit=6`)
        const d = await r.json()
        setResults(d.items || [])
      } catch {}
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(true) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const close = () => { setOpen(false); setQuery(''); setResults([]) }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Caută"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Caută destinație...</span>
        <kbd className="hidden md:inline ml-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={close}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută destinație, oraș, țară..."
                className="flex-1 outline-none text-lg"
              />
              <button onClick={close} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!query && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  💡 Începe să scrii numele unui oraș sau țări (ex: "Paris", "Asia", "plajă")
                </div>
              )}

              {query && query.length < 2 && (
                <div className="p-6 text-center text-slate-400 text-sm">Mai scrie 1 caracter...</div>
              )}

              {loading && (
                <div className="p-6 text-center text-slate-500 text-sm">Se caută...</div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="text-slate-600 font-medium">Niciun rezultat pentru "{query}"</div>
                  <div className="text-xs text-slate-400 mt-1">Încearcă alt termen sau cere AI să genereze un ghid nou!</div>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      href={`/blog/${r.slug}`}
                      onClick={close}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-cyan-50 transition-colors"
                    >
                      <img src={r.cover} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{r.title}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3" />{r.country} · {r.continent} · {r.type}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  ))}
                  <Link
                    href={`/blog?search=${encodeURIComponent(query)}`}
                    onClick={close}
                    className="block px-5 py-3 text-center text-sm text-cyan-600 font-semibold hover:bg-cyan-50 border-t border-slate-100"
                  >
                    Vezi toate rezultatele pentru "{query}" →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
