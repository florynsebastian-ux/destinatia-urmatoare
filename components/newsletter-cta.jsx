'use client'

import { useState } from 'react'
import { Mail, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function NewsletterCTA({ compact = false }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await r.json()
      if (r.ok) {
        setDone(true)
        toast.success('Te-ai abonat cu succes! 🌍')
      } else {
        toast.error(data.error || 'Eroare la abonare')
      }
    } catch (e) {
      toast.error('Eroare de rețea')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Email-ul tău"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white"
        />
        <Button type="submit" disabled={loading || done} className="bg-cyan-500 hover:bg-cyan-600">
          {done ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    )
  }

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-cyan-500 via-sky-500 to-teal-500 rounded-3xl p-8 md:p-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Călătorește cu noi, săptămânal
            </h2>
            <p className="text-cyan-50 text-lg mb-8 leading-relaxed">
              Primește ghiduri exclusive, oferte de zboruri și inspirație direct în inbox.
              Fără spam, doar aventuri.
            </p>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="adresa ta de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white text-slate-900 h-12 text-base border-0"
              />
              <Button
                type="submit"
                disabled={loading || done}
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-6 font-semibold"
              >
                {done ? (
                  <><Check className="w-4 h-4 mr-2" />Abonat!</>
                ) : (
                  <>Abonează-te<Send className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
            <p className="text-xs text-cyan-100 mt-4">Te poți dezabona oricând. Citește politica noastră de confidențialitate.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
