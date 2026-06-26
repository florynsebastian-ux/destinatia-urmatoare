'use client'

import { Bed, ExternalLink, Star } from 'lucide-react'

// CJ Affiliate (Commission Junction) tracking link for Booking.com.
// Public IDs — safe to hardcode (they appear on every rendered page anyway).
const CJ_CLICK = 'https://www.dpbolvw.net/click-101805987-15735418'
const CJ_PIXEL = 'https://www.awltovhc.com/image-101805987-15735418'

/**
 * Builds a deep link to Booking.com pre-filtered for the destination,
 * tracked through CJ.
 */
function buildBookingUrl(city = '', country = '') {
  const dest = [city, country].filter(Boolean).join(', ')
  const inner = dest
    ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}&aid=&lang=ro`
    : 'https://www.booking.com/?lang=ro'
  return `${CJ_CLICK}?url=${encodeURIComponent(inner)}`
}

/**
 * Inline CTA button — drop it after the Accommodation section.
 * Variants: 'card' (rich), 'button' (compact)
 */
export default function BookingCTA({ city, country, variant = 'card' }) {
  const href = buildBookingUrl(city, country)
  const dest = [city, country].filter(Boolean).join(', ') || 'această destinație'

  if (variant === 'button') {
    return (
      <>
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#003580] hover:bg-[#0056b3] text-white font-semibold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all no-underline"
        >
          <Bed className="w-5 h-5" />
          Vezi cazare pe Booking
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>
        {/* CJ impression pixel */}
        <img src={CJ_PIXEL} alt="" width="1" height="1" style={{ position: 'absolute', opacity: 0 }} />
      </>
    )
  }

  // Default: rich card variant
  return (
    <div className="my-8 not-prose">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#003580] to-[#0056b3] p-6 md:p-8 text-white shadow-lg">
        {/* Decorative bed icon */}
        <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
          <Bed className="w-40 h-40" strokeWidth={1} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full">
              Cazare · Booking.com
            </span>
            <div className="flex items-center gap-0.5 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <h3 className="font-display font-bold text-2xl md:text-3xl mb-2 leading-tight">
            Caută cele mai bune hoteluri în {dest}
          </h3>
          <p className="text-blue-100 text-sm md:text-base mb-5 max-w-xl leading-relaxed">
            Compară prețuri pe Booking.com — anulare gratuită pe majoritatea opțiunilor, plata
            la cazare disponibilă. Recenzii reale de la milioane de călători.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={href}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#003580] hover:bg-blue-50 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all no-underline"
            >
              <Bed className="w-5 h-5" />
              Vezi prețurile actuale
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className="text-xs text-blue-200">
              ✓ Anulare gratuită · ✓ Best price guarantee
            </span>
          </div>
        </div>
      </div>

      {/* CJ impression pixel (1x1 tracking image) */}
      <img src={CJ_PIXEL} alt="" width="1" height="1" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      <p className="text-xs text-slate-400 mt-2 text-center italic">
        Link afiliat — primim un comision mic dacă rezervi prin acest link, fără cost suplimentar pentru tine.
      </p>
    </div>
  )
}
