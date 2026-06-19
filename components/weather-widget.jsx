'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Thermometer, MapPin } from 'lucide-react'

const WEATHER_ICONS = {
  0: { Icon: Sun, label: 'Senin', color: 'text-amber-500' },
  1: { Icon: Sun, label: 'Aproape senin', color: 'text-amber-400' },
  2: { Icon: Cloud, label: 'Parțial înnorat', color: 'text-slate-400' },
  3: { Icon: Cloud, label: 'Înnorat', color: 'text-slate-500' },
  45: { Icon: Cloud, label: 'Ceață', color: 'text-slate-400' },
  48: { Icon: Cloud, label: 'Ceață cu gheață', color: 'text-slate-500' },
  51: { Icon: CloudRain, label: 'Burniță ușoară', color: 'text-blue-400' },
  61: { Icon: CloudRain, label: 'Ploaie ușoară', color: 'text-blue-500' },
  63: { Icon: CloudRain, label: 'Ploaie moderată', color: 'text-blue-600' },
  65: { Icon: CloudRain, label: 'Ploaie puternică', color: 'text-blue-700' },
  71: { Icon: CloudSnow, label: 'Ninsoare ușoară', color: 'text-sky-300' },
  73: { Icon: CloudSnow, label: 'Ninsoare', color: 'text-sky-400' },
  75: { Icon: CloudSnow, label: 'Ninsoare puternică', color: 'text-sky-500' },
  95: { Icon: CloudRain, label: 'Furtună', color: 'text-purple-600' },
}

function getWeatherInfo(code) {
  return WEATHER_ICONS[code] || { Icon: Cloud, label: '—', color: 'text-slate-400' }
}

export default function WeatherWidget({ city, country }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // 1. Geocode city -> lat/lon (Open-Meteo, FREE, no key)
        const geoR = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ro&format=json`
        )
        const geo = await geoR.json()
        if (!geo.results?.[0]) { setError(true); return }
        const { latitude, longitude, name, country: c } = geo.results[0]

        // 2. Get current + forecast
        const wR = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`
        )
        const w = await wR.json()
        if (!cancelled) setData({ ...w, locationName: name, locationCountry: c })
      } catch (e) {
        if (!cancelled) setError(true)
      }
    }
    if (city) load()
    return () => { cancelled = true }
  }, [city])

  if (error || !data) {
    return null // fail silently if weather unavailable
  }

  const cur = data.current
  const info = getWeatherInfo(cur.weather_code)
  const { Icon } = info

  return (
    <div className="not-prose my-6 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 rounded-2xl p-6 text-white overflow-hidden relative">
      <div className="absolute -top-4 -right-4 opacity-10">
        <Icon className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-cyan-50 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>Vremea acum în {data.locationName}, {data.locationCountry}</span>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <Icon className={`w-16 h-16 text-white`} strokeWidth={1.5} />
          <div>
            <div className="text-5xl font-bold">{Math.round(cur.temperature_2m)}°C</div>
            <div className="text-cyan-50 text-sm">{info.label}</div>
          </div>
        </div>

        <div className="flex gap-4 text-xs mb-5 text-cyan-50">
          <div className="flex items-center gap-1"><Droplets className="w-3 h-3" />{cur.relative_humidity_2m}% umiditate</div>
          <div className="flex items-center gap-1"><Wind className="w-3 h-3" />{Math.round(cur.wind_speed_10m)} km/h vânt</div>
        </div>

        <div className="border-t border-white/20 pt-4">
          <div className="text-xs text-cyan-100 mb-2">Următoarele 3 zile:</div>
          <div className="grid grid-cols-3 gap-2">
            {data.daily.time.slice(1, 4).map((d, i) => {
              const code = data.daily.weather_code[i + 1]
              const dInfo = getWeatherInfo(code)
              const DIcon = dInfo.Icon
              const max = Math.round(data.daily.temperature_2m_max[i + 1])
              const min = Math.round(data.daily.temperature_2m_min[i + 1])
              const date = new Date(d)
              const day = date.toLocaleDateString('ro-RO', { weekday: 'short' })
              return (
                <div key={d} className="bg-white/10 backdrop-blur rounded-xl p-2 text-center">
                  <div className="text-xs font-semibold">{day}</div>
                  <DIcon className="w-6 h-6 mx-auto my-1" />
                  <div className="text-xs">{max}° / {min}°</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 text-[10px] text-cyan-100/80">Date vreme: Open-Meteo</div>
      </div>
    </div>
  )
}
