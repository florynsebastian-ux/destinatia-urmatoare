'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Image gallery with full-screen lightbox.
 * @param {string[]} images - array of image URLs
 * @param {string} title - article title (for alt-text)
 * @param {string} cityCountry - text for caption
 */
export default function Lightbox({ images = [], title = '', cityCountry = '' }) {
  const [idx, setIdx] = useState(null) // null = closed

  const open = (i) => setIdx(i)
  const close = () => setIdx(null)
  const prev = useCallback(() => setIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length)), [images.length])
  const next = useCallback(() => setIdx((i) => (i === null ? null : (i + 1) % images.length)), [images.length])

  useEffect(() => {
    if (idx === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [idx, prev, next])

  if (!images.length) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => open(i)}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            aria-label={`Mărește imaginea ${i + 1}`}
          >
            <Image
              src={img}
              alt={`${cityCountry} - ${title} - imagine ${i + 1}`}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width:768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 7v6M7 10h6"/></svg>
            </div>
          </button>
        ))}
      </div>

      {idx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); close() }}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Închide"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
            {idx + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Imagine anterioară"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Imagine următoare"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-12 my-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[idx]}
              alt={`${cityCountry} - ${title} - imagine ${idx + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Caption */}
          {(cityCountry || title) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/40 backdrop-blur px-4 py-2 rounded-full max-w-[90vw] text-center truncate">
              {cityCountry} {title ? `· ${title}` : ''}
            </div>
          )}
        </div>
      )}
    </>
  )
}
