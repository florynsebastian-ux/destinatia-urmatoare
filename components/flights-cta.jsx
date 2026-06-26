'use client'

import { Plane, ExternalLink, ArrowRight } from 'lucide-react'

// CJ Affiliate (Commission Junction) tracking for Booking.com FLIGHTS.
const CJ_CLICK = 'https://www.jdoqocy.com/click-101805987-17061694'
const CJ_PIXEL = 'https://www.awltovhc.com/image-101805987-17061694'

/**
 * Deep link to Booking.com flights for a destination.
 * Booking flights uses city search via `?type_=ow&from=&to=CITY,COUNTRY`
 * For maximum compatibility we just open the flights homepage in Romanian;
 * the destination is mentioned in the CTA copy.
 */
function buildFlightsUrl(city = '', country = '') {
  const dest = [city, country].filter(Boolean).join(', ')
  const inner = dest
    ? `https://flights.booking.com/?lang=ro&utm_medium=affiliate&utm_source=destinatiaurmatoare&dest=${encodeURIComponent(dest)}`
    : 'https://flights.booking.com/?lang=ro'
  return `${CJ_CLICK}?url=${encodeURIComponent(inner)}`
}

/**
 * Plane CTA card — drop into the Transport section of an article.
 */
export default function FlightsCTA({ city, country }) {
  const href = buildFlightsUrl(city, country)
  const dest = [city, country].filter(Boolean).join(', ') || 'această destinație'

  return (
    <div className="my-8 not-prose">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-sky-700 p-6 md:p-8 text-white shadow-lg">
        {/* Decorative plane icon */}
        <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none rotate-12">
          <Plane className="w-44 h-44" strokeWidth={1} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full">
              Zboruri · Booking.com
            </span>
            <span className="text-xs text-cyan-100">✈️ Compară 700+ companii</span>
          </div>

          <h3 className="font-display font-bold text-2xl md:text-3xl mb-2 leading-tight">
            Caută zboruri ieftine spre {dest}
          </h3>
          <p className="text-cyan-50 text-sm md:text-base mb-5 max-w-xl leading-relaxed">
            Compară prețuri de la zeci de linii aeriene și site-uri de rezervări. Filtre pentru
            bagaj inclus, escală directă, ore preferate. Plata sigură + protecție anti-anulare.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={href}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-cyan-700 hover:bg-cyan-50 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all no-underline"
            >
              <Plane className="w-5 h-5" />
              Vezi prețurile zboruri
              <ArrowRight className="w-4 h-4" />
            </a>
            <span className="text-xs text-cyan-100">
              ✓ Best price guarantee · ✓ Fără taxe ascunse
            </span>
          </div>
        </div>
      </div>

      {/* CJ impression pixel */}
      <img src={CJ_PIXEL} alt="" width="1" height="1" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      <p className="text-xs text-slate-400 mt-2 text-center italic">
        Link afiliat — primim un comision mic dacă rezervi prin acest link, fără cost suplimentar pentru tine.
      </p>
    </div>
  )
}
