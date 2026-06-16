'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ArticleClient({ slug }) {
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [slug])

  const load = async () => {
    try {
      const r = await fetch(`/api/comments?slug=${slug}`)
      const d = await r.json()
      setComments(d.items || [])
    } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!name || !message) return
    setLoading(true)
    try {
      const r = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, message }),
      })
      if (r.ok) {
        setName('')
        setMessage('')
        toast.success('Comentariu publicat!')
        load()
      } else {
        toast.error('Eroare la trimitere')
      }
    } catch {
      toast.error('Eroare de rețea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="not-prose mt-16 pt-12 border-t border-slate-100">
      <h2 className="font-display text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <MessageCircle className="w-7 h-7 text-cyan-600" />
        Comentarii ({comments.length})
      </h2>
      <p className="text-slate-600 mb-8">Spune-ne ce părere ai sau împărtășește experiența ta.</p>

      <form onSubmit={submit} className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-4">
        <Input placeholder="Numele tău" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white h-11" />
        <Textarea placeholder="Scrie un comentariu..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="bg-white" />
        <Button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
          {loading ? 'Se trimite...' : <><Send className="w-4 h-4 mr-2" />Publicați</>}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-slate-500 text-center py-8">Fii primul care comentează!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                {c.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                <div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">{c.message}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
