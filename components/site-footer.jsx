import Link from 'next/link'
import { Plane, Instagram, Facebook, Youtube, Twitter, Mail } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-bold text-white">Destinația Următoare</span>
            </Link>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Inspirație, ghiduri detaliate și itinerarii pentru călătorii care vor să vadă lumea
              altfel. Fiecare poveste este o invitație la aventură.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-cyan-500 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Navigare</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-cyan-400">Toate Ghidurile</Link></li>
              <li><Link href="/travel-tips" className="hover:text-cyan-400">Travel Tips</Link></li>
              <li><Link href="/despre" className="hover:text-cyan-400">Despre mine</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Continente</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog?continent=Europa" className="hover:text-cyan-400">Europa</Link></li>
              <li><Link href="/blog?continent=Asia" className="hover:text-cyan-400">Asia</Link></li>
              <li><Link href="/blog?continent=America" className="hover:text-cyan-400">America</Link></li>
              <li><Link href="/blog?continent=Africa" className="hover:text-cyan-400">Africa</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Destinația Următoare. Toate drepturile rezervate.</p>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <a href="mailto:contact@destinatiaurmatoare.eu" className="hover:text-cyan-400">contact@destinatiaurmatoare.eu</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
