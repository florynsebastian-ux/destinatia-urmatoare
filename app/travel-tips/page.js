import Image from 'next/image'
import { Briefcase, Plane, Shield, PiggyBank, Compass, Wifi } from 'lucide-react'
import Link from 'next/link'
import NewsletterCTA from '@/components/newsletter-cta'

export const metadata = { title: 'Travel Tips', description: 'Sfaturi practice pentru călători' }

const TIPS = [
  { Icon: Briefcase, color: 'from-cyan-500 to-teal-500', title: 'Cum să-ți faci bagajul perfect',
    text: 'Regula minimumului: împachetează jumătate din hainele pe care le-ai planificat. Rulă-le, nu le împachetă. Pune cele grele jos. Lasă 25% spațiu liber pentru suveniruri.',
    bullets: ['Rulă hainele – economisești 30% spațiu', 'Folosește cuburi de organizare', 'Pune un set de schimb în bagajul de mână'] },
  { Icon: Plane, color: 'from-sky-500 to-cyan-500', title: 'Cum să găsești zboruri ieftine',
    text: 'Cumpără marțea dimineața – statistică confirmată. Folosește modul incognito. Caută cu Google Flights în „Explore”. Marți/miercuri zboarele sunt mai ieftine.',
    bullets: ['Caută cu 6-8 săptămâni înainte intern, 3-4 luni internațional', 'Setatori alerte pe Hopper sau Skyscanner', 'Aterizează în aeroporturi secundare – economii pana la 40%'] },
  { Icon: Shield, color: 'from-emerald-500 to-cyan-500', title: 'Siguranța în călătorii',
    text: 'Spunecuiva drag itinerarul tău. Salvează contactele de urgență. Fă-ți pozele cu pașaportul în Google Drive. Nu ții toate cardurile în același loc.',
    bullets: ['Money belt sub haine pentru actele/cash important', 'Aplicație offline maps + Google Translate', 'Învață ce să spui în limba locală în caz de urgență'] },
  { Icon: PiggyBank, color: 'from-amber-500 to-orange-500', title: 'Cum să economisești bani',
    text: 'Mânâncă la prânz unde mănâncă localnicii – 30-50% reducere față de seara. Folosește transportul public. Stați în hostele cu private rooms – cazare bună la preț mic.',
    bullets: ['Carte de debit Revolut/N26 – fără comisioane', 'Cumpără SIM local, nu roaming', 'Free walking tours în orașele mari'] },
  { Icon: Shield, color: 'from-rose-500 to-pink-500', title: 'Asigurarea de călătorie',
    text: 'NU călători fără asigurare. World Nomads, SafetyWing sau IATI – alegeri bune. Verifică acoperirea pentru sporturi extreme dacă ți le programezi.',
    bullets: ['Acoperire minimă medicală: 100.000 €', 'Anulare călătorie + pierderi bagaje', 'Citește polița înainte de plată'] },
  { Icon: Compass, color: 'from-violet-500 to-purple-500', title: 'Organizarea itinerariului',
    text: 'Nu suprasolicita zilele. Maxim 2-3 atracții majore pe zi. Lasă timp să te rătăcești. Folosește Notion sau Google Sheets pentru planificare.',
    bullets: ['Dimineața: atracții majore (mai puțină mulțime)', 'După-amiaza: zone locale, plimbări', 'Seara: experiențe culturale (concert, restaurant)'] },
]

export default function TravelTipsPage() {
  return (
    <div className="pt-32 pb-20">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="inline-block bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">Travel Tips</div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 mb-6">Sfaturi practice de la călători experimentați</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          De la bagaje la siguranță, de la zboruri ieftine la asigurări – tot ce trebuie să știi înainte să pleci.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {TIPS.map((tip, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 card-hover">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tip.color} flex items-center justify-center mb-5`}>
                <tip.Icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">{tip.title}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">{tip.text}</p>
              <ul className="space-y-2">
                {tip.bullets.map((b, k) => (
                  <li key={k} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-cyan-500 flex-shrink-0">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-24"><NewsletterCTA /></div>
    </div>
  )
}
