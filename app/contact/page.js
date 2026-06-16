'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Send, Instagram, Facebook, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Contact() {
  const [data, setData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (r.ok) {
        setDone(true)
        toast.success('Mesajul a fost trimis!')
      } else {
        const d = await r.json()
        toast.error(d.error || 'Eroare')
      }
    } catch {
      toast.error('Eroare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-20">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">Contact</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 mb-4">Hai să vorbim</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Idei, colaborari, întrebări sau doar un „salut!” – sunt aici.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-8 text-white mb-6">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Email direct</h3>
              <a href="mailto:contact@urmatoareadestinatie.ro" className="text-cyan-50 hover:text-white">contact@urmatoareadestinatie.ro</a>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <h3 className="font-display text-xl font-bold mb-4">Găsește-mă pe</h3>
              <div className="flex gap-3">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-11 h-11 rounded-full bg-slate-100 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="bg-white rounded-2xl p-8 border border-slate-100 space-y-4">
            <div>
              <Label>Nume</Label>
              <Input required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="h-11 mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="h-11 mt-1" />
            </div>
            <div>
              <Label>Mesaj</Label>
              <Textarea required rows={5} value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} className="mt-1" />
            </div>
            <Button type="submit" disabled={loading || done} className="bg-cyan-500 hover:bg-cyan-600 w-full h-11">
              {done ? 'Trimis!' : (<><Send className="w-4 h-4 mr-2" />Trimite mesajul</>)}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
