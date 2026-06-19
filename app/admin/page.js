'use client'

import { useEffect, useState } from 'react'
import { Lock, LogOut, Plus, Edit, Trash2, Save, X, Eye, Star, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

const BLANK = {
  title: '', slug: '', excerpt: '', cover: '',
  continent: 'Europa', country: '', city: '', type: 'City Break',
  tags: '', readingMinutes: 8, featured: false, author: 'Andrei Munteanu',
  intro: '', whenToVisit: '', budget: '', transport: '', accommodation: '',
  attractions: [{ name: '', description: '' }],
  restaurants: [{ name: '', description: '' }],
  tips: [''],
  gallery: [''],
  publishedAt: new Date().toISOString().slice(0, 10),
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [pwd, setPwd] = useState('')
  const [articles, setArticles] = useState([])
  const [editing, setEditing] = useState(null)
  const [view, setView] = useState('list') // list | edit | ai
  const [aiForm, setAiForm] = useState({ city: '', country: '', type: 'City Break', duration: '5 zile', budget: 'mediu' })
  const [aiLoading, setAiLoading] = useState(false)
  const [bulkCities, setBulkCities] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, results: [] })

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('ud_admin_token') : null
    if (t) {
      setToken(t)
      loadArticles()
    }
  }, [])

  const loadArticles = async () => {
    const r = await fetch('/api/articles?limit=100')
    const d = await r.json()
    setArticles(d.items || [])
  }

  const login = async (e) => {
    e.preventDefault()
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      const d = await r.json()
      if (r.ok) {
        setToken(d.token)
        localStorage.setItem('ud_admin_token', d.token)
        toast.success('Bine ai venit!')
        loadArticles()
      } else {
        toast.error(d.error || 'Parolă incorectă')
      }
    } catch {
      toast.error('Eroare')
    }
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem('ud_admin_token')
  }

  const startEdit = (a) => {
    if (a) {
      setEditing({
        ...a,
        tags: Array.isArray(a.tags) ? a.tags.join(', ') : (a.tags || ''),
        attractions: a.attractions?.length ? a.attractions : [{ name: '', description: '' }],
        restaurants: a.restaurants?.length ? a.restaurants : [{ name: '', description: '' }],
        tips: a.tips?.length ? a.tips : [''],
        gallery: a.gallery?.length ? a.gallery : [''],
      })
    } else {
      setEditing({ ...BLANK })
    }
    setView('edit')
  }

  const save = async () => {
    if (!editing.title || !editing.slug) {
      toast.error('Titlu și slug sunt obligatorii')
      return
    }
    const body = {
      ...editing,
      tags: typeof editing.tags === 'string' ? editing.tags.split(',').map((t) => t.trim()).filter(Boolean) : editing.tags,
      readingMinutes: parseInt(editing.readingMinutes, 10) || 8,
      attractions: editing.attractions.filter((a) => a.name),
      restaurants: editing.restaurants.filter((r) => r.name),
      tips: editing.tips.filter((t) => t),
      gallery: editing.gallery.filter((g) => g),
    }
    try {
      const isUpdate = !!editing.id
      const r = await fetch(isUpdate ? `/api/articles/${editing.id}` : '/api/articles', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (r.ok) {
        toast.success(isUpdate ? 'Articol actualizat!' : 'Articol publicat!')
        setView('list')
        loadArticles()
      } else {
        toast.error(d.error || 'Eroare la salvare')
      }
    } catch {
      toast.error('Eroare')
    }
  }

  const remove = async (id) => {
    if (!confirm('Sigur ștergi acest articol?')) return
    const r = await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Token': token },
    })
    if (r.ok) {
      toast.success('Articol șters')
      loadArticles()
    }
  }

  const generateWithAI = async () => {
    if (!aiForm.city) {
      toast.error('Introdu numele orașului')
      return
    }
    setAiLoading(true)
    try {
      const r = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify(aiForm),
      })
      const d = await r.json()
      if (r.ok && d.article) {
        toast.success('Articol generat! Verifică și salvează.')
        setEditing({
          ...d.article,
          tags: Array.isArray(d.article.tags) ? d.article.tags.join(', ') : '',
          attractions: d.article.attractions || [{ name: '', description: '' }],
          restaurants: d.article.restaurants || [{ name: '', description: '' }],
          tips: d.article.tips || [''],
          gallery: d.article.gallery || [''],
        })
        setView('edit')
      } else {
        toast.error(d.error || 'Eroare la generare')
      }
    } catch (e) {
      toast.error('Eroare de rețea')
    } finally {
      setAiLoading(false)
    }
  }

  const bulkGenerateAndSave = async () => {
    const lines = bulkCities.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) {
      toast.error('Adaugă cel puțin un oraș')
      return
    }
    if (lines.length > 15) {
      toast.error('Maxim 15 orașe per batch')
      return
    }
    setBulkLoading(true)
    setBulkProgress({ current: 0, total: lines.length, results: [] })

    const results = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Parse: "City, Country" or just "City"
      const parts = line.split(',').map(p => p.trim())
      const city = parts[0]
      const country = parts[1] || ''

      setBulkProgress({ current: i + 1, total: lines.length, results })
      try {
        const r = await fetch('/api/ai/generate-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
          body: JSON.stringify({ city, country, type: 'City Break', duration: '5 zile', budget: 'mediu' }),
        })
        const d = await r.json()
        if (r.ok && d.article) {
          // Auto-save the generated article
          const saveBody = {
            ...d.article,
            tags: Array.isArray(d.article.tags) ? d.article.tags : [],
            attractions: d.article.attractions || [],
            restaurants: d.article.restaurants || [],
            tips: d.article.tips || [],
            gallery: d.article.gallery || [],
          }
          delete saveBody.coverImageQuery
          delete saveBody.galleryImageQueries
          const saveR = await fetch('/api/ai/save-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
            body: JSON.stringify(saveBody),
          })
          if (saveR.ok) {
            results.push({ city, status: 'success', title: d.article.title, slug: d.article.slug })
          } else {
            results.push({ city, status: 'error', error: 'Eroare salvare' })
          }
        } else {
          results.push({ city, status: 'error', error: d.error || 'Eroare AI' })
        }
      } catch (e) {
        results.push({ city, status: 'error', error: 'Eroare rețea' })
      }
    }

    setBulkProgress({ current: lines.length, total: lines.length, results })
    setBulkLoading(false)
    toast.success(`Gata! ${results.filter(r => r.status === 'success').length}/${results.length} articole publicate`)
    loadArticles()
  }

  if (!token) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-sky-50">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-cyan-500 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Acces administrator</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <Label htmlFor="pwd">Parolă</Label>
              <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Introdu parola" className="h-11 mt-1" autoFocus />
            </div>
            <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 h-11">
              Autentificare
            </Button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">Parola implicită: admin123 (configurabilă în .env)</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">{articles.length} articole publicate</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {view === 'list' && (
            <>
              <Button onClick={() => setView('bulk')} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                <Sparkles className="w-4 h-4 mr-2" />Bulk AI (5+ articole)
              </Button>
              <Button onClick={() => setView('ai')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Sparkles className="w-4 h-4 mr-2" />Generează cu AI
              </Button>
              <Button onClick={() => startEdit(null)} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" />Articol nou
              </Button>
            </>
          )}
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />Ieșire
          </Button>
        </div>
      </div>

      {view === 'list' && (
        <div className="grid gap-3">
          {articles.map((a) => (
            <Card key={a.id} className="p-4 flex items-center gap-4 hover:border-cyan-300 transition-colors">
              <img src={a.cover} alt={a.title} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">{a.continent}</Badge>
                  <Badge variant="outline">{a.type}</Badge>
                  {a.featured && <Badge className="bg-amber-500"><Star className="w-3 h-3 mr-1" />Recomandat</Badge>}
                </div>
                <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                <p className="text-sm text-slate-500 truncate">{a.country} · /blog/{a.slug}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/blog/${a.slug}`} target="_blank">
                  <Button variant="outline" size="icon"><Eye className="w-4 h-4" /></Button>
                </Link>
                <Button variant="outline" size="icon" onClick={() => startEdit(a)}><Edit className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => remove(a.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === 'bulk' && (
        <Card className="p-8 max-w-3xl mx-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                Bulk AI Generator
              </h2>
              <p className="text-slate-600 text-sm mt-1">Generează 5-15 articole în paralel. Toate se salvează automat în site.</p>
            </div>
            <Button variant="ghost" onClick={() => { setView('list'); setBulkProgress({ current: 0, total: 0, results: [] }) }} disabled={bulkLoading}><X className="w-4 h-4" /></Button>
          </div>

          {!bulkLoading && bulkProgress.results.length === 0 && (
            <>
              <Field label="🌍 Listă orașe (unul per linie). Format: 'Oraș' sau 'Oraș, Țară'">
                <Textarea
                  value={bulkCities}
                  onChange={(e) => setBulkCities(e.target.value)}
                  placeholder={`Praga, Cehia\nViena, Austria\nMadrid, Spania\nAmsterdam\nKrakow, Polonia`}
                  rows={10}
                  className="font-mono text-sm"
                />
              </Field>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-900 mb-4">
                <p className="font-semibold mb-2">⏱️ Estimări:</p>
                <ul className="text-xs space-y-1">
                  <li>• Fiecare articol durează ~45-60 secunde</li>
                  <li>• 5 articole = ~5 minute</li>
                  <li>• 10 articole = ~10 minute</li>
                  <li>• Articolele se salvează automat — nu trebuie să apeși Save</li>
                  <li>• Tip călătorie: City Break, Durată: 5 zile, Buget: Mediu (default)</li>
                </ul>
              </div>
              <Button
                onClick={bulkGenerateAndSave}
                size="lg"
                disabled={!bulkCities.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-12"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generează și publică toate articolele
              </Button>
            </>
          )}

          {(bulkLoading || bulkProgress.results.length > 0) && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {bulkLoading ? `Procesează ${bulkProgress.current}/${bulkProgress.total}...` : `Gata! ${bulkProgress.results.filter(r => r.status === 'success').length}/${bulkProgress.total} reușite`}
                </span>
                {bulkLoading && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 transition-all duration-500"
                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bulkProgress.results.map((r, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${r.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.status === 'success' ? '✅' : '❌'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{r.title || r.city}</div>
                        {r.slug && <div className="text-xs text-slate-500">/blog/{r.slug}</div>}
                        {r.error && <div className="text-xs text-red-600">{r.error}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!bulkLoading && (
                <Button onClick={() => { setBulkProgress({ current: 0, total: 0, results: [] }); setBulkCities(''); setView('list') }} className="mt-6 w-full">
                  Înapoi la lista articole
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {view === 'ai' && (
        <Card className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Generator AI de articole
              </h2>
              <p className="text-slate-600 text-sm mt-1">Spune-i AI-ului ce destinație vrei și el îți face întreg articolul în ~45 secunde</p>
            </div>
            <Button variant="ghost" onClick={() => setView('list')} disabled={aiLoading}><X className="w-4 h-4" /></Button>
          </div>

          <div className="space-y-4">
            <Field label="🌍 Oraș / Destinație *">
              <Input
                value={aiForm.city}
                onChange={(e) => setAiForm({ ...aiForm, city: e.target.value })}
                placeholder="Ex: Lisabona, Praga, Brașov, Bali, Bangkok..."
                className="h-11 text-base"
                autoFocus
                disabled={aiLoading}
              />
            </Field>

            <Field label="🗺️ Țara (opțional, AI o detectează automat)">
              <Input
                value={aiForm.country}
                onChange={(e) => setAiForm({ ...aiForm, country: e.target.value })}
                placeholder="Ex: Portugalia, Cehia, România..."
                className="h-11"
                disabled={aiLoading}
              />
            </Field>

            <div className="grid md:grid-cols-3 gap-4">
              <Field label="🎒 Tip călătorie">
                <select className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white" value={aiForm.type} onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })} disabled={aiLoading}>
                  <option>City Break</option><option>Aventură</option><option>Romantic</option><option>Cultural</option><option>Plajă</option><option>Backpacking</option>
                </select>
              </Field>

              <Field label="⏰ Durată">
                <select className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white" value={aiForm.duration} onChange={(e) => setAiForm({ ...aiForm, duration: e.target.value })} disabled={aiLoading}>
                  <option>2 zile</option><option>3 zile</option><option>4 zile</option><option>5 zile</option><option>7 zile</option><option>10 zile</option><option>14 zile</option>
                </select>
              </Field>

              <Field label="💰 Buget">
                <select className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white" value={aiForm.budget} onChange={(e) => setAiForm({ ...aiForm, budget: e.target.value })} disabled={aiLoading}>
                  <option value="mic">Mic (backpacker)</option>
                  <option value="mediu">Mediu (standard)</option>
                  <option value="mare">Mare (lux)</option>
                </select>
              </Field>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900">
              <p className="font-semibold mb-1">✨ AI va genera automat:</p>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                <li>✅ Titlu SEO + slug URL</li>
                <li>✅ Rezumat captivant</li>
                <li>✅ Introducere narativă</li>
                <li>✅ Când să vizitezi</li>
                <li>✅ Buget detaliat în EUR</li>
                <li>✅ Transport (aeroport + oraș)</li>
                <li>✅ Cazare cu cartiere</li>
                <li>✅ 5-7 Obiective turistice</li>
                <li>✅ 3-5 Restaurante</li>
                <li>✅ 5-7 Sfaturi practice</li>
                <li>✅ Tags SEO</li>
                <li>✅ Galerie imagini</li>
              </ul>
              <p className="mt-2 text-xs italic">După generare poți edita orice câmp înainte de publicare.</p>
            </div>

            <Button
              onClick={generateWithAI}
              disabled={aiLoading || !aiForm.city}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 text-base"
            >
              {aiLoading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />AI scrie articolul... (~45 sec)</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />Generează articolul</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {view === 'edit' && editing && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">{editing.id ? 'Editare articol' : 'Articol nou'}</h2>
            <Button variant="ghost" onClick={() => setView('list')}><X className="w-4 h-4" /></Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field label="Titlu *"><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Slug (URL) *"><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></Field>
          </div>

          <Field label="Rezumat"><Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} /></Field>

          <Field label="URL imagine principală"><Input value={editing.cover} onChange={(e) => setEditing({ ...editing, cover: e.target.value })} placeholder="https://..." /></Field>

          <div className="grid md:grid-cols-4 gap-4">
            <Field label="Continent">
              <select className="w-full h-10 px-3 rounded-md border border-slate-200" value={editing.continent} onChange={(e) => setEditing({ ...editing, continent: e.target.value })}>
                <option>Europa</option><option>Asia</option><option>America</option><option>Africa</option><option>Oceania</option>
              </select>
            </Field>
            <Field label="Țară"><Input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></Field>
            <Field label="Oraș"><Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
            <Field label="Tip călătorie">
              <select className="w-full h-10 px-3 rounded-md border border-slate-200" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option>City Break</option><option>Aventură</option><option>Romantic</option><option>Cultural</option><option>Plajă</option><option>Backpacking</option>
              </select>
            </Field>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Field label="Tags (separat prin virgulă)"><Input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="travel, europa, city" /></Field>
            <Field label="Timp citire (min)"><Input type="number" value={editing.readingMinutes} onChange={(e) => setEditing({ ...editing, readingMinutes: e.target.value })} /></Field>
            <Field label="Data publicare"><Input type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} /></Field>
            <Field label="Autor"><Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></Field>
          </div>

          <label className="flex items-center gap-2 mt-2 mb-6">
            <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
            <span className="text-sm">Marcă ca „Recomandat” (apare pe homepage)</span>
          </label>

          <Field label="Introducere (conținut principal, paragrafe separate prin rând gol)">
            <Textarea value={editing.intro} onChange={(e) => setEditing({ ...editing, intro: e.target.value })} rows={6} />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Când să vizitezi"><Textarea value={editing.whenToVisit} onChange={(e) => setEditing({ ...editing, whenToVisit: e.target.value })} rows={3} /></Field>
            <Field label="Buget estimativ"><Textarea value={editing.budget} onChange={(e) => setEditing({ ...editing, budget: e.target.value })} rows={3} /></Field>
            <Field label="Transport"><Textarea value={editing.transport} onChange={(e) => setEditing({ ...editing, transport: e.target.value })} rows={3} /></Field>
            <Field label="Cazare recomandată"><Textarea value={editing.accommodation} onChange={(e) => setEditing({ ...editing, accommodation: e.target.value })} rows={3} /></Field>
          </div>

          <ArrayField title="Obiective turistice" items={editing.attractions}
            onChange={(v) => setEditing({ ...editing, attractions: v })}
            template={{ name: '', description: '' }}
            render={(item, set) => (
              <div className="grid md:grid-cols-3 gap-2">
                <Input placeholder="Nume obiectiv" value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} />
                <Textarea placeholder="Descriere" value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} rows={1} className="md:col-span-2" />
              </div>
            )} />

          <ArrayField title="Restaurante" items={editing.restaurants}
            onChange={(v) => setEditing({ ...editing, restaurants: v })}
            template={{ name: '', description: '' }}
            render={(item, set) => (
              <div className="grid md:grid-cols-3 gap-2">
                <Input placeholder="Nume restaurant" value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} />
                <Textarea placeholder="Descriere" value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} rows={1} className="md:col-span-2" />
              </div>
            )} />

          <ArrayField title="Sfaturi utile" items={editing.tips}
            onChange={(v) => setEditing({ ...editing, tips: v })}
            template=""
            render={(item, set) => (
              <Input placeholder="Un sfat util" value={item} onChange={(e) => set(e.target.value)} />
            )} />

          <ArrayField title="Galerie (URL-uri imagini)" items={editing.gallery}
            onChange={(v) => setEditing({ ...editing, gallery: v })}
            template=""
            render={(item, set) => (
              <Input placeholder="https://..." value={item} onChange={(e) => set(e.target.value)} />
            )} />

          <div className="flex gap-3 mt-8 sticky bottom-4 bg-white p-3 rounded-xl border border-slate-200 shadow-lg">
            <Button onClick={save} className="bg-cyan-500 hover:bg-cyan-600 flex-1"><Save className="w-4 h-4 mr-2" />Salvează</Button>
            <Button variant="outline" onClick={() => setView('list')}>Anulează</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
    </div>
  )
}

function ArrayField({ title, items, onChange, template, render }) {
  return (
    <div className="mb-6 bg-slate-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <Button size="sm" variant="outline" onClick={() => onChange([...items, typeof template === 'string' ? '' : { ...template }])}>
          <Plus className="w-3 h-3 mr-1" />Adaugă
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">{render(item, (newVal) => {
              const copy = [...items]
              copy[i] = newVal
              onChange(copy)
            })}</div>
            <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, k) => k !== i))} className="text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
