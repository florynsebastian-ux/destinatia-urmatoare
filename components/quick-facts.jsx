'use client'

import { useEffect, useState } from 'react'
import { Coins, Languages, Clock, Building2, Phone, Globe2 } from 'lucide-react'
import { getCountryFacts } from '@/lib/country-data'

export default function QuickFacts({ country }) {
  // Resolve instantly from hardcoded data so the card always renders.
  const initial = getCountryFacts(country)
  const [data, setData] = useState(initial)

  // Optional enhancement: try REST Countries to enrich/override.
  // If it fails or is slow, we already have hardcoded data displayed.
  useEffect(() => {
    let cancelled = false
    if (!country) return
    const enName = initial?.en || country
    fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(enName)}?fields=capital,currencies,languages,timezones,idd,flag,region,subregion`)
      .then(r => (r.ok ? r.json() : null))
      .then(arr => {
        if (cancelled || !arr) return
        const c = Array.isArray(arr) ? arr[0] : arr
        if (!c) return
        const cur = Object.values(c.currencies || {})[0] || {}
        const langs = Object.values(c.languages || {})
        const callingCode = c.idd?.root ? `${c.idd.root}${(c.idd.suffixes || [])[0] || ''}` : ''
        setData(prev => ({
          ...(prev || {}),
          flag: c.flag || prev?.flag,
          capital: (c.capital || [])[0] || prev?.capital,
          currency: cur.name ? `${cur.name} (${cur.symbol || ''})` : prev?.currency,
          languages: langs.length ? langs.join(', ') : prev?.languages,
          timezone: (c.timezones || [])[0] || prev?.timezone,
          callingCode: callingCode || prev?.callingCode,
          region: c.subregion || c.region || prev?.region,
        }))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [country, initial])

  if (!data) return null

  const items = [
    { icon: Building2, label: 'Capitală', value: data.capital, color: 'text-rose-500' },
    { icon: Coins, label: 'Monedă', value: data.currency || data.currencyCode, color: 'text-amber-500' },
    { icon: Languages, label: 'Limba', value: data.languages, color: 'text-emerald-500' },
    { icon: Clock, label: 'Fus orar', value: data.timezone, color: 'text-blue-500' },
    { icon: Phone, label: 'Prefix', value: data.callingCode, color: 'text-purple-500' },
    { icon: Globe2, label: 'Regiune', value: data.region, color: 'text-cyan-500' },
  ].filter(it => it.value)

  return (
    <div className="my-8 not-prose">
      <div className="rounded-2xl bg-gradient-to-br from-cyan-50 via-white to-blue-50 border border-cyan-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          {data.flag && <span className="text-4xl leading-none">{data.flag}</span>}
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">Informații utile {country ? `· ${country}` : ''}</h3>
            <p className="text-xs text-slate-500">Date esențiale pentru călătoria ta</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((it, i) => {
            const Icon = it.icon
            return (
              <div key={i} className="flex items-start gap-2.5">
                <Icon className={`w-5 h-5 ${it.color} flex-shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{it.label}</div>
                  <div className="text-sm font-medium text-slate-800 truncate" title={it.value}>{it.value}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
