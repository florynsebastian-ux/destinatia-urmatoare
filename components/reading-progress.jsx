'use client'

import { useEffect, useState } from 'react'

/**
 * Sticky progress bar at the top of the page that fills as the user scrolls
 * through the article content. Tracks the <article> element if available,
 * otherwise falls back to viewport scroll.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calc = () => {
      const article = document.querySelector('article')
      if (!article) {
        // Fallback: page scroll
        const scrolled = window.scrollY
        const total = document.documentElement.scrollHeight - window.innerHeight
        setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
        return
      }
      const rect = article.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = -rect.top
      const p = total > 0 ? Math.max(0, Math.min(100, (scrolled / total) * 100)) : 0
      setProgress(p)
    }

    calc()
    let raf = null
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(calc)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', calc, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', calc)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Hide when at the very top (not started reading)
  const visible = progress > 0.5

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms' }}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        style={{
          width: `${progress}%`,
          transition: 'width 80ms linear',
        }}
      />
    </div>
  )
}
