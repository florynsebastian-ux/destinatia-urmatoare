'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Loader2 } from 'lucide-react'

// Dynamic import the WHOLE map (not individual leaflet pieces) — most stable pattern
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  ),
})

// Hardcoded coords for major travel destinations — instant fallback if geocoding fails.
// Keys are lowercase city names (Romanian or English).
const CITY_COORDS = {
  paris: [48.8566, 2.3522], londra: [51.5074, -0.1278], london: [51.5074, -0.1278],
  roma: [41.9028, 12.4964], rome: [41.9028, 12.4964], madrid: [40.4168, -3.7038],
  barcelona: [41.3851, 2.1734], lisabona: [38.7223, -9.1393], lisbon: [38.7223, -9.1393],
  amsterdam: [52.3676, 4.9041], berlin: [52.52, 13.405], 'munchen': [48.1351, 11.582], munich: [48.1351, 11.582],
  viena: [48.2082, 16.3738], vienna: [48.2082, 16.3738], praga: [50.0755, 14.4378], prague: [50.0755, 14.4378],
  varsovia: [52.2297, 21.0122], warsaw: [52.2297, 21.0122], krakow: [50.0647, 19.945], cracovia: [50.0647, 19.945],
  budapesta: [47.4979, 19.0402], budapest: [47.4979, 19.0402], bratislava: [48.1486, 17.1077],
  bruxelles: [50.8503, 4.3517], brussels: [50.8503, 4.3517], copenhaga: [55.6761, 12.5683], copenhagen: [55.6761, 12.5683],
  stockholm: [59.3293, 18.0686], oslo: [59.9139, 10.7522], helsinki: [60.1699, 24.9384],
  reykjavik: [64.1466, -21.9426], dublin: [53.3498, -6.2603], edinburgh: [55.9533, -3.1883],
  zurich: [47.3769, 8.5417], geneva: [46.2044, 6.1432], 'zürich': [47.3769, 8.5417],
  atena: [37.9838, 23.7275], athens: [37.9838, 23.7275], santorini: [36.3932, 25.4615],
  mykonos: [37.4467, 25.3289], istanbul: [41.0082, 28.9784],
  bucuresti: [44.4268, 26.1025], 'bucurești': [44.4268, 26.1025], bucharest: [44.4268, 26.1025],
  brasov: [45.6427, 25.5887], 'brașov': [45.6427, 25.5887], cluj: [46.7712, 23.6236],
  sibiu: [45.7983, 24.1256], sofia: [42.6977, 23.3219], belgrad: [44.7866, 20.4489], belgrade: [44.7866, 20.4489],
  zagreb: [45.815, 15.9819], dubrovnik: [42.6507, 18.0944], split: [43.5081, 16.4402],
  tokyo: [35.6762, 139.6503], 'osaka': [34.6937, 135.5023], kyoto: [35.0116, 135.7681],
  seoul: [37.5665, 126.978], pequin: [39.9042, 116.4074], beijing: [39.9042, 116.4074],
  shanghai: [31.2304, 121.4737], 'hong kong': [22.3193, 114.1694], hongkong: [22.3193, 114.1694],
  singapore: [1.3521, 103.8198], bangkok: [13.7563, 100.5018], 'phuket': [7.8804, 98.3923],
  bali: [-8.3405, 115.092], denpasar: [-8.6705, 115.2126], jakarta: [-6.2088, 106.8456],
  hanoi: [21.0285, 105.8542], 'ho chi minh': [10.8231, 106.6297], saigon: [10.8231, 106.6297],
  manila: [14.5995, 120.9842], delhi: [28.6139, 77.209], 'new delhi': [28.6139, 77.209],
  mumbai: [19.076, 72.8777], dubai: [25.2048, 55.2708], 'abu dhabi': [24.4539, 54.3773],
  doha: [25.2854, 51.531], 'tel aviv': [32.0853, 34.7818], ierusalim: [31.7683, 35.2137], jerusalem: [31.7683, 35.2137],
  cairo: [30.0444, 31.2357], marrakech: [31.6295, -7.9811], casablanca: [33.5731, -7.5898],
  fez: [34.0181, -5.0078], 'cape town': [-33.9249, 18.4241], nairobi: [-1.2921, 36.8219],
  'new york': [40.7128, -74.006], nyc: [40.7128, -74.006], 'los angeles': [34.0522, -118.2437],
  'san francisco': [37.7749, -122.4194], chicago: [41.8781, -87.6298], miami: [25.7617, -80.1918],
  'las vegas': [36.1699, -115.1398], 'washington dc': [38.9072, -77.0369], washington: [38.9072, -77.0369],
  boston: [42.3601, -71.0589], toronto: [43.6532, -79.3832], vancouver: [49.2827, -123.1207],
  montreal: [45.5017, -73.5673], 'mexico city': [19.4326, -99.1332], cancun: [21.1619, -86.8515],
  havana: [23.1136, -82.3666], 'rio de janeiro': [-22.9068, -43.1729], 'sao paulo': [-23.5505, -46.6333],
  'buenos aires': [-34.6037, -58.3816], lima: [-12.0464, -77.0428], cusco: [-13.5319, -71.9675],
  sydney: [-33.8688, 151.2093], melbourne: [-37.8136, 144.9631], auckland: [-36.8485, 174.7633],
}

const normalize = (s = '') => s.trim().toLowerCase()

export default function ArticleMap({ city, country, title }) {
  const fallbackCoords = (() => {
    const key = normalize(city)
    if (CITY_COORDS[key]) return { lat: CITY_COORDS[key][0], lon: CITY_COORDS[key][1], name: city }
    // try removing diacritics
    const keyNoDiacritics = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (CITY_COORDS[keyNoDiacritics]) return { lat: CITY_COORDS[keyNoDiacritics][0], lon: CITY_COORDS[keyNoDiacritics][1], name: city }
    return null
  })()

  const [coords, setCoords] = useState(fallbackCoords)
  const [loading, setLoading] = useState(!fallbackCoords)

  useEffect(() => {
    let cancelled = false
    if (fallbackCoords) return // we already have coords, no need to geocode
    const q = encodeURIComponent(`${city || ''} ${country || ''}`.trim())
    if (!q) { setLoading(false); return }
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=ro&format=json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return
        const hit = d?.results?.[0]
        if (hit?.latitude && hit?.longitude) {
          setCoords({ lat: hit.latitude, lon: hit.longitude, name: hit.name })
        }
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [city, country, fallbackCoords])

  if (loading) {
    return (
      <div className="my-8 not-prose">
        <div className="rounded-2xl bg-slate-100 h-72 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }
  if (!coords) return null

  return (
    <div className="my-8 not-prose">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-cyan-600" />
        <h3 className="font-display font-bold text-xl text-slate-900">Locația pe hartă</h3>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 360 }}>
        <LeafletMap
          lat={coords.lat}
          lon={coords.lon}
          name={coords.name || city}
          country={country}
          title={title}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">Click pe hartă pentru a explora. Zoom cu butoanele sau pinch.</p>
    </div>
  )
}
