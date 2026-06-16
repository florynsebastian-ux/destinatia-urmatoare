'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Plane, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/', label: 'Acasă' },
  { href: '/blog', label: 'Ghiduri' },
  { href: '/travel-tips', label: 'Travel Tips' },
  { href: '/despre', label: 'Despre' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              transparent ? 'bg-white/20 backdrop-blur' : 'bg-cyan-500'
            }`}>
              <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className={`font-display text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap ${
              transparent ? 'text-white' : 'text-slate-900'
            }`}>
              Destinația Următoare
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== '/' && pathname?.startsWith(n.href))
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? transparent
                        ? 'bg-white/20 text-white backdrop-blur'
                        : 'bg-cyan-50 text-cyan-700'
                      : transparent
                        ? 'text-white/90 hover:bg-white/10'
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {n.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="/blog">
              <Button
                size="sm"
                className={`rounded-full font-medium ${
                  transparent
                    ? 'bg-white text-cyan-700 hover:bg-cyan-50'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                Explorează
              </Button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2">
            {open ? (
              <X className={transparent ? 'text-white' : 'text-slate-900'} />
            ) : (
              <Menu className={transparent ? 'text-white' : 'text-slate-900'} />
            )}
          </button>
        </div>

        {open && (
          <div className="lg:hidden bg-white border-t border-slate-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 py-4 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 font-medium"
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
