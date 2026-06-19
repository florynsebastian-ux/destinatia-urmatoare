'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ud_cookie_consent')
    if (!consent) {
      // Show after a tiny delay so it doesn't flash
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('ud_cookie_consent', 'accepted')
    setVisible(false)
  }
  const reject = () => {
    localStorage.setItem('ud_cookie_consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-sm">Folosim cookies 🍪</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Folosim cookies pentru a îmbunătăți experiența ta, statistici (Google Analytics) și reclame relevante (Google AdSense).{' '}
            <Link href="/politica-cookies" className="text-cyan-600 underline">Detalii</Link>
          </p>
        </div>
        <button onClick={reject} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <Button onClick={reject} variant="outline" size="sm" className="flex-1 text-xs">
          Doar esențiale
        </Button>
        <Button onClick={accept} size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-xs">
          Accept toate
        </Button>
      </div>
    </div>
  )
}
