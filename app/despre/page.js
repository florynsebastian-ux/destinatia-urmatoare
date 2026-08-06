import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Plane, Camera, Award, Heart, Compass, Globe2, ArrowRight, Quote, Users, Coffee, Mail } from 'lucide-react'
import NewsletterCTA from '@/components/newsletter-cta'
import Breadcrumbs from '@/components/breadcrumbs'
import { getAuthorBySlug } from '@/lib/authors'

export const metadata = {
  title: 'Despre mine · Andrei, călător pasionat',
  description: 'Salut, sunt Andrei — călătoresc de peste 10 ani. Aici e povestea mea, filozofia de călătorie și de ce am creat Destinația Următoare.',
  alternates: { canonical: '/despre' },
  openGraph: {
    title: 'Despre mine · Destinația Următoare',
    description: 'Povestea unui călător cu 10+ ani de experiență în 40+ țări.',
    type: 'profile',
  },
}

const TIMELINE = [
  { year: '2014', title: 'Prima aventură', text: 'Am părăsit jobul corporate și mi-am cumpărat un bilet dus în Bangkok. Șase luni prin Asia de Sud-Est mi-au schimbat total perspectiva.', emoji: '🎒' },
  { year: '2016', title: 'Călătoresc full-time', text: 'Am devenit nomad digital. Freelancing + călătorii. Am trăit în Bali, Chiang Mai, Lisabona, Berlin. Toate m-au învățat ceva.', emoji: '🌍' },
  { year: '2019', title: 'Primul ghid publicat', text: 'Am realizat că îmi place să scriu despre destinații mai mult decât să le doar fotografiez. A început ideea unui blog serios.', emoji: '✍️' },
  { year: '2022', title: 'Îmi construiesc autoritatea', text: 'Colaborări cu companii de travel, ghiduri pentru publicații online. Peste 40 de țări bifate deja pe hartă.', emoji: '🏆' },
  { year: '2025', title: 'Destinația Următoare', text: 'Am lansat acest blog cu o singură misiune: ghiduri detaliate, oneste și utile pentru călătorii români. Fără clișee, fără sponsorizări ascunse.', emoji: '🚀' },
]

const VALUES = [
  { title: 'Slow travel', text: 'Prefer o lună într-un loc decât 10 orașe în 2 săptămâni. Adânc, nu larg.', emoji: '🐢', color: 'from-emerald-500 to-teal-500' },
  { title: 'Local first', text: 'Mâncăm unde mănâncă localnicii, dormim în cartierele lor. Turism etic.', emoji: '🏡', color: 'from-amber-500 to-orange-500' },
  { title: 'Off-the-beaten-path', text: 'Căutăm experiențe autentice, nu doar Instagram spots supraaglomerate.', emoji: '🗺️', color: 'from-violet-500 to-purple-500' },
  { title: 'Testat personal', text: 'Nu recomand niciodată un loc unde nu am fost. Fiecare sfat e trăit.', emoji: '✓', color: 'from-cyan-500 to-blue-500' },
  { title: 'Fără sponsorizări ascunse', text: 'Când sunt afiliați, îți spun clar. Recomandările sunt oneste, nu vândute.', emoji: '🤝', color: 'from-rose-500 to-pink-500' },
  { title: 'Buget realist', text: 'Nu doar cazări de lux. Îți arăt cum se poate și cu buget mic, dacă vrei.', emoji: '💰', color: 'from-yellow-500 to-amber-500' },
]

const FAVORITES = [
  { country: '🇯🇵 Japonia', reason: 'Combinație perfectă între tradiție și futurism. Kyoto rămâne primul meu iubit.' },
  { country: '🇮🇸 Islanda', reason: 'Peisajele te fac să simți că ești pe altă planetă. Road trip-ul complet e obligatoriu.' },
  { country: '🇮🇩 Indonezia', reason: 'Bali e doar începutul. Insulele mai puțin cunoscute (Sumba, Flores) sunt și mai magice.' },
  { country: '🇵🇹 Portugalia', reason: 'Cel mai underrated european. Lisabona, Porto, Douro Valley, Azores – variație uriașă.' },
]

const FAQS = [
  { q: 'Cum finanțezi călătoriile?', a: 'Combinație: veniturile din blog (Google AdSense, afiliați precum Booking), colaborări cu companii de travel, freelancing ocazional. Nu sunt milionar, doar prioritizez altfel.' },
  { q: 'Călătorești singur sau cu cineva?', a: 'Amândouă. Multe călătorii solo (dă mai multă libertate), altele cu prieteni sau parteneră. Fiecare experiență are farmecul ei.' },
  { q: 'Pot să lucrez cu tine?', a: 'Da, sunt deschis la colaborări cu companii de travel, boarduri turistice și branduri care respectă audiența mea. Scrie-mi pe email.' },
  { q: 'Ce urmează pentru tine?', a: 'În 2026 vreau să vizitez Peru, Kenya și să revin în Vietnam. Poate și un proiect video pe YouTube.' },
]

export default function DespreePage() {
  const author = getAuthorBySlug('andrei-munteanu')

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      description: author.bio,
      image: author.avatar,
      jobTitle: author.jobTitle,
      knowsAbout: author.expertise,
    },
    inLanguage: 'ro-RO',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO fullwidth */}
      <section className="relative h-[75vh] min-h-[550px] flex items-end overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
          alt="Călătorie prin lume - hartă și instrumente de călătorie"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/30" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-white w-full">
          <div className="inline-block bg-cyan-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            👋 Salut!
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight max-w-4xl mb-5">
            Eu sunt <span className="text-cyan-300">Andrei</span>
          </h1>
          <p className="text-cyan-50 text-lg md:text-xl max-w-2xl leading-relaxed">
            Călătoresc de peste 10 ani, am vizitat 40+ țări și scriu despre călătorii cu pasiune și onestitate. Aici e povestea mea.
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ name: 'Despre mine' }]} />
      </div>

      {/* Intro card cu poza + text */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-2 order-1">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image src={author.avatar} alt={author.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 40vw" />
            </div>
          </div>
          <div className="md:col-span-3 order-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Povestea</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-5 leading-tight">
              De la biroul corporate la călător full-time
            </h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                În 2014, aveam un job „bun&rdquo; la o corporație din București. Bani decenți, program lung, weekend-uri epuizate. Într-o dimineață mi-am dat seama că cel mai fericit moment al săptămânii era vinerea seara — și cel mai trist, duminica seara. Am înțeles ceva era greșit.
              </p>
              <p>
                Am făcut ce părea nebunesc atunci: mi-am dat demisia și am cumpărat un bilet dus către Bangkok. Șase luni prin Asia de Sud-Est mi-au schimbat total ce credeam despre bani, timp și fericire.
              </p>
              <p>
                De-atunci, am vizitat <strong className="text-slate-900">40+ țări pe 5 continente</strong>, am scris <strong className="text-slate-900">200+ articole</strong> și am învățat că magia călătoriei nu stă în destinație, ci în oamenii pe care îi întâlnești și în felul în care schimbă modul în care vezi lumea.
              </p>
              <p>
                Pe <strong>Destinația Următoare</strong> public ghiduri testate personal, recomandări reale și sfaturi care ți-au schimbat realmente călătoriile. Fără sponsorizări ascunse, fără clișee.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/autor/andrei-munteanu" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors">
                <Users className="w-4 h-4" /> Vezi portofoliu articole
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-700 font-semibold px-5 py-2.5 rounded-full transition-colors">
                <Mail className="w-4 h-4" /> Contactează-mă
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: Plane, val: '40+', lbl: 'Țări', color: 'text-cyan-600 bg-cyan-50' },
            { Icon: Camera, val: '200+', lbl: 'Articole scrise', color: 'text-amber-600 bg-amber-50' },
            { Icon: Globe2, val: '5', lbl: 'Continente', color: 'text-emerald-600 bg-emerald-50' },
            { Icon: Award, val: '10+', lbl: 'Ani călătorii', color: 'text-rose-600 bg-rose-50' },
          ].map((s, i) => (
            <div key={i} className="text-center bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 mx-auto rounded-2xl ${s.color} flex items-center justify-center mb-3`}>
                <s.Icon className="w-6 h-6" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-slate-900">{s.val}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-1">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Cronologie</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Drumul meu în călătorii</h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 md:-translate-x-1/2" aria-hidden="true" />
          <div className="space-y-10">
            {TIMELINE.map((t, i) => (
              <div key={i} className={`relative flex flex-col md:flex-row items-start gap-6 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-6 md:left-1/2 top-4 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-white md:-translate-x-1/2" />
                <div className="pl-16 md:pl-0 md:w-1/2 md:px-8">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-cyan-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{t.emoji}</span>
                      <div>
                        <div className="text-xs uppercase tracking-widest font-bold text-cyan-600">{t.year}</div>
                        <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">{t.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{t.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Principii</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Filozofia mea de călătorie</h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Șase valori care mă ghidează în fiecare călătorie și în fiecare articol pe care îl scriu.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="relative bg-white p-6 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4 text-2xl`}>
                {v.emoji}
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{v.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAVORITE COUNTRIES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Preferate</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            Țările care mi-au furat inima
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {FAVORITES.map((f, i) => (
            <div key={i} className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 border border-cyan-100 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Quote className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-display font-bold text-xl text-slate-900 mb-2">{f.country}</div>
                  <p className="text-slate-700 text-sm leading-relaxed">{f.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">FAQ</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Întrebări frecvente</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-white border border-slate-200 rounded-xl p-5 group">
              <summary className="font-display font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between gap-3">
                <span>{f.q}</span>
                <span className="text-cyan-500 group-open:rotate-45 transition-transform text-2xl leading-none flex-shrink-0">+</span>
              </summary>
              <p className="text-slate-700 leading-relaxed mt-3 pt-3 border-t border-slate-100">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 md:p-10 text-white text-center shadow-xl">
          <Coffee className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">Vrem să vorbim?</h3>
          <p className="text-cyan-50 mb-6 max-w-xl mx-auto">
            Ai o întrebare, o colaborare, sau doar vrei să spui salut? Mă bucur mereu de emailuri de la călători ca tine.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-cyan-700 hover:bg-cyan-50 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-xl transition-all">
            <Mail className="w-5 h-5" /> Scrie-mi un email
          </Link>
        </div>
      </section>

      <div className="pt-6 pb-4"><NewsletterCTA /></div>
    </>
  )
}
