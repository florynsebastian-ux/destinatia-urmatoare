import Image from 'next/image'
import Link from 'next/link'
import {
  Briefcase, Plane, Shield, PiggyBank, Compass, Wifi, Utensils, Camera,
  Heart, Globe2, CreditCard, Users, Clock, MapPin, Sparkles, Sun,
} from 'lucide-react'
import NewsletterCTA from '@/components/newsletter-cta'
import Breadcrumbs from '@/components/breadcrumbs'

export const metadata = {
  title: 'Sfaturi de călătorie · Ghid complet pentru călători',
  description: 'Peste 30 de sfaturi practice de la un călător cu 10+ ani de experiență: bagaje, zboruri ieftine, siguranță, buget, asigurări, itinerarii. Tot ce trebuie să știi înainte să pleci.',
  keywords: ['sfaturi calatorie', 'travel tips romana', 'zboruri ieftine', 'bagaj perfect', 'asigurare calatorie', 'buget calatorie', 'siguranta turisti'],
  alternates: { canonical: '/travel-tips' },
  openGraph: {
    title: 'Sfaturi de călătorie · 30+ recomandări de la un călător experimentat',
    description: 'De la cum să-ți faci bagajul până la asigurări — tot ce trebuie să știi.',
    type: 'article',
  },
}

const CATEGORIES = [
  { id: 'pregatire', label: 'Pregătire', icon: Briefcase, color: 'from-cyan-500 to-teal-500' },
  { id: 'zboruri', label: 'Zboruri', icon: Plane, color: 'from-sky-500 to-cyan-500' },
  { id: 'buget', label: 'Buget', icon: PiggyBank, color: 'from-amber-500 to-orange-500' },
  { id: 'siguranta', label: 'Siguranță', icon: Shield, color: 'from-rose-500 to-pink-500' },
  { id: 'experienta', label: 'Experiență', icon: Compass, color: 'from-violet-500 to-purple-500' },
  { id: 'tehnologie', label: 'Tehnologie', icon: Wifi, color: 'from-emerald-500 to-teal-500' },
]

const TIPS = [
  // PREGĂTIRE
  { cat: 'pregatire', Icon: Briefcase, title: 'Bagajul perfect în 6 pași',
    text: 'Regula minimumului: împachetează jumătate din hainele pe care le-ai planificat. Rulă-le, nu le împachetă. Pune cele grele jos. Lasă 25% spațiu liber pentru suveniruri.',
    bullets: ['Rulă hainele – economisești 30% spațiu', 'Folosește cuburi de organizare (packing cubes)', 'Pune un set de schimb în bagajul de mână', 'Kit medical minimal: analgezice, pansamente, medicamente personale', '2 perechi ochelari (soare + normali)', 'Adaptor universal + bancă externă 10.000 mAh'] },
  { cat: 'pregatire', Icon: Camera, title: 'Documente esențiale',
    text: 'Pașaport valabil minim 6 luni după data întoarcerii. Verifică cerințele de viză cu 2 luni înainte. Fă poze cu toate documentele importante și salvează-le în cloud.',
    bullets: ['Pașaport + cel puțin 2 copii fizice separate', 'Poze digitale (Google Drive) cu pașaport, CI, permis auto', 'Card asigurare de sănătate (EHIC pentru UE)', 'Rezervări (hoteluri, zboruri) printate + digital', 'Contacte de urgență scrise pe hârtie'] },
  { cat: 'pregatire', Icon: Sun, title: 'Ce să porți în avion',
    text: 'Haine în straturi, pantofi comozi (dar nu sport), un pulover subțire chiar și vara. Evită jeans strâmți la zboruri lungi – umflatura picioarelor e reală.',
    bullets: ['Pantaloni lejeri, tricou moale, jachetă subțire', 'Șosete confortabile (avion e rece 20-22°C)', 'Nu bijuterii voluminoase (metal detector)', 'Slippers/papuci pentru zboruri >6h'] },

  // ZBORURI
  { cat: 'zboruri', Icon: Plane, title: 'Cum găsești zboruri ieftine',
    text: 'Cumpără marțea dimineața – statistic confirmat. Folosește modul incognito. Caută cu Google Flights în „Explore". Marți/miercuri zboarele sunt mai ieftine.',
    bullets: ['Caută cu 6-8 săptămâni înainte intern, 3-4 luni internațional', 'Setează alerte pe Skyscanner, Google Flights, Hopper', 'Aterizează în aeroporturi secundare – economii până la 40%', 'Zboară marți/miercuri – mai ieftin ca vineri/duminică', 'Verifică zboruri „error fare" pe Secret Flying'] },
  { cat: 'zboruri', Icon: Clock, title: 'Escale sau zbor direct?',
    text: 'Escale = economii 20-40%, dar necesită minimum 2h între zboruri (3h intercontinental). Pentru primă vizită într-un oraș, verifică dacă compania oferă „free stopover" (Icelandair, Turkish, Emirates).',
    bullets: ['Minim 2h escală în același terminal', '3h+ pentru schimb aeroport (Londra STN → LHR e 2h singur transport)', 'Free stopover: Islanda, Turcia, EAU, Portugalia', 'Nu rezerva 2 bilete separate – dacă ratezi legătura, ești pe cont propriu'] },
  { cat: 'zboruri', Icon: MapPin, title: 'Loc perfect în avion',
    text: 'Zboruri lungi: cere geam (te sprijini să dormi) sau culoar (te miști liber). Evită locurile de la ieșirile de urgență decât dacă ești înalt. Ultimele rânduri – mai zgomotoase dar și mai libere.',
    bullets: ['Culoar pentru zboruri >4h (te miști la baie fără să deranjezi)', 'Rânduri față = ies primul + spațiu pentru picioare', 'Aripi = cel mai lin loc pentru turbulențe', 'Evită rândurile ultima 5 (aproape de bucătărie = zgomot noaptea)'] },

  // BUGET
  { cat: 'buget', Icon: PiggyBank, title: 'Economisește 30-50% la mâncare',
    text: 'Mănâncă la prânz unde mănâncă localnicii – 30-50% reducere față de seara. „Menu del día" în Spania, „prix fixe" în Franța, „set lunch" în Asia. Aceleași restaurante, jumătate preț.',
    bullets: ['Cumpără mic dejun din supermarket local (nu hotel)', 'Prânz complet la localnici: 8-15€ în Europa, 3-5€ în Asia', 'Rezervare cină doar când merită cu adevărat', 'Food markets = ieftin + autentic + variat'] },
  { cat: 'buget', Icon: CreditCard, title: 'Carduri fără comisioane',
    text: 'Revolut, N26, Wise – ratele reale de schimb, zero comisioane la retrageri până la o limită. Ai măcar 2 carduri diferite (unul pierdut nu-ți strică vacanța).',
    bullets: ['Revolut Metal / N26 You – retrageri gratuite până la 200€/lună', 'Wise Multi-Currency – conversie la rată reală', 'Nu accepta niciodată DCC (plată în lei la ATM străin) – 5-8% pierdere', 'Anunță banca înainte să pleci – blocări preventive comune'] },
  { cat: 'buget', Icon: Users, title: 'Cazare inteligentă',
    text: 'Hostele cu camere private = calitate hotel la 40% din preț. Airbnb pentru grupuri >3 sau șederi >5 zile. Booking pentru orașe mari (recenzii verificate). Evită „aparthotel" foarte cool pe TikTok – suprapreț garantat.',
    bullets: ['Hostele boutique (Generator, Selina, MEININGER) – design + preț mic', 'Airbnb doar cu >100 review-uri și rating >4.7', 'Rezervare cu 2-3 luni înainte pentru orașe populare', 'Verifică politica de anulare gratuită (multe permit anulare fără cost)'] },

  // SIGURANȚĂ
  { cat: 'siguranta', Icon: Shield, title: 'Siguranța în orașe străine',
    text: 'Spune cuiva drag itinerarul tău. Salvează contactele de urgență. Fă-ți pozele cu pașaportul în Google Drive. Nu ține toate cardurile în același loc.',
    bullets: ['Money belt sub haine pentru acte + cash important', 'Aplicație offline maps (maps.me) + Google Translate offline', 'Învață „ajutor" și „poliție" în limba locală', 'Divide cash-ul: 30% în seif hotel, 30% în money belt, 40% cu tine'] },
  { cat: 'siguranta', Icon: Heart, title: 'Asigurarea de călătorie',
    text: 'NU călători fără asigurare. World Nomads, SafetyWing sau IATI – alegeri bune. Verifică acoperirea pentru sporturi extreme dacă le programezi. O simplă intervenție dentară costă 300-1000€ în afara UE.',
    bullets: ['Acoperire minimă medicală: 100.000 €', 'Anulare călătorie + pierderi bagaje incluse', 'Verifică lista de sporturi acoperite (surf, schi, hiking >2000m)', 'Salvează polița în drive + printeaz-o', 'Card EHIC pentru UE (gratuit) – nu înlocuiește asigurarea privată'] },
  { cat: 'siguranta', Icon: Globe2, title: 'Escrocherii comune – atenție!',
    text: 'Cea mai frecventă: „prietenul din stradă" care te „ajută" cu direcții și cere bacșiș. Taxiuri fără contor. Meniuri „turistice" cu prețuri triple. Falsii polițiști care cer să vadă portmoneul.',
    bullets: ['Taxi doar cu aplicație (Uber, Bolt, Free Now) – tarif clar', 'Nu accepta „gratis" nimic pe stradă (bratari, flori, poze)', 'Polițiștii adevărați nu-ți cer să scoți portmoneul', 'La restaurant, cere meniu cu prețuri ÎNAINTE să comanzi'] },

  // EXPERIENȚĂ
  { cat: 'experienta', Icon: Compass, title: 'Organizarea itinerariului',
    text: 'Nu suprasolicita zilele. Maxim 2-3 atracții majore pe zi. Lasă timp să te rătăcești – acolo se întâmplă cele mai frumoase momente. Folosește Notion sau Google Sheets pentru planificare.',
    bullets: ['Dimineața: atracții majore (mai puțină mulțime)', 'După-amiaza: zone locale, plimbări', 'Seara: experiențe culturale (concert, restaurant)', 'Rezervă biletele online cu skip-the-line', 'Zi buffer în fiecare săptămână – fără plan, doar explorare'] },
  { cat: 'experienta', Icon: Utensils, title: 'Cum să mănânci ca un local',
    text: 'Regula 3 blocuri: mergi 3 blocuri distanță de atracțiile turistice, prețurile scad cu 40%. Vezi unde sunt cozi de localnici la prânz. Meniu doar în limba locală = semn bun.',
    bullets: ['Google Maps: filtrează cu >4.4 rating și >200 review-uri', 'Evită localurile cu poze mari cu mâncare în fereastră', 'Locuri fără meniu în engleză = autentice', 'Cere „ce ați mânca voi azi" – conversație bonus + recomandare bună'] },
  { cat: 'experienta', Icon: Sparkles, title: 'Free walking tours',
    text: 'În orașele mari (Praga, Barcelona, Roma, Berlin...), grupuri de ghizi locali oferă tururi „gratis" – plătești cât consideri la final (5-15€ e OK). Cel mai bun mod să înțelegi orașul în 2h.',
    bullets: ['Rezervă prin GuruWalk, FreeTour.com sau Sandemans', 'Merge cu tur în primele zile – restul cazării devine mai clar', 'Bacșiș 10€/persoană = corect pentru un tur bun', 'Tururi tematice: mafie în Palermo, comunism în Berlin, artă în Florența'] },

  // TEHNOLOGIE
  { cat: 'tehnologie', Icon: Wifi, title: 'Internet mobil ieftin',
    text: 'eSIM (Airalo, Holafly) = cel mai simplu în 2026. Setezi în 5 min din avion, ai date imediat ce aterizezi. Cost: 5-15€ pentru 5GB / 7 zile. Alternativ, SIM local – mai ieftin dar cere ID.',
    bullets: ['Airalo: eSIM pentru 200+ țări, plan din avion', 'Holafly: date nelimitate (mai scump, dar comod)', 'Verifică că telefonul suportă eSIM (iPhone XS+, Samsung S20+)', 'Roaming UE: gratuit între țările UE – nu-ți face SIM extra'] },
  { cat: 'tehnologie', Icon: Camera, title: 'Aplicații indispensabile',
    text: 'Google Maps offline (descarcă zona înainte), Google Translate (cu conversație în timp real), XE Currency, Booking, Rome2Rio (transport între orașe), TripAdvisor (recenzii verificate).',
    bullets: ['Google Maps – descarcă hartă offline pe wifi hotel', 'Google Translate – mode „conversație" real time', 'Rome2Rio – „cum ajung din X în Y" cu preț', 'PackPoint – checklist bagaj personalizat', 'Splitwise – împărțit costuri cu prieteni'] },
]

// FAQ Schema — huge SEO win for tips page
const FAQS = [
  { q: 'Care e cea mai importantă recomandare pentru un începător?', a: 'Nu suprasolicita zilele. Maximum 2-3 atracții majore pe zi. Lasă spațiu pentru descoperiri neplanuite – acolo se întâmplă cele mai memorabile momente ale unei călătorii.' },
  { q: 'Cât costă în medie o călătorie de 7 zile în Europa?', a: 'Depinde de destinație și stil. Backpacker: 400-600€ (hostele + transport public + mâncare street food). Mediu: 800-1400€ (hoteluri 3*, restaurante decente). Confort: 1500-3000€+ (hoteluri 4-5*, taxi, restaurante bune). Zborul separat, în funcție de sezon.' },
  { q: 'Am nevoie de asigurare de călătorie chiar și în UE?', a: 'Da, chiar dacă ai card EHIC. EHIC acoperă doar urgențe medicale la instituții publice. Nu acoperă repatriere, anulare călătorie, pierderi bagaje, sau tratamente private. O asigurare de 15-30€/săptămână te protejează complet.' },
  { q: 'Cum evit escrocheriile în orașe turistice?', a: 'Nu accepta niciodată „gratis" nimic pe stradă (bratari, flori, poze). Folosește doar taxiuri prin aplicații (Uber, Bolt, Free Now). Cere meniu cu prețuri înainte să comanzi la restaurant. Polițiștii adevărați NU-ți cer să scoți portmoneul.' },
]

export default function TravelTipsPage() {
  // JSON-LD FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  // JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Sfaturi de călătorie · Ghid complet',
    description: metadata.description,
    author: { '@type': 'Person', name: 'Andrei Munteanu', url: '/autor/andrei-munteanu' },
    publisher: { '@type': 'Organization', name: 'Destinația Următoare' },
    inLanguage: 'ro-RO',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Sfaturi de călătorie - valiză și hartă pregătite pentru drum"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-white w-full">
          <div className="inline-block bg-cyan-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            ✈️ Ghid Complet
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl mb-5">
            Sfaturi de călătorie
          </h1>
          <p className="text-cyan-50 text-lg md:text-xl max-w-2xl leading-relaxed">
            Peste <strong className="text-white">{TIPS.length * 5}+ recomandări testate</strong> — de la bagaje la asigurări, de la zboruri ieftine la escrocherii comune. Tot ce trebuie să știi înainte să pleci.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {CATEGORIES.map(c => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <c.icon className="w-4 h-4" />
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ name: 'Sfaturi de călătorie' }]} />
      </div>

      {/* Intro stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: TIPS.length, label: 'Categorii de sfaturi' },
            { val: '10+', label: 'Ani de experiență' },
            { val: '40+', label: 'Țări explorate' },
            { val: '100%', label: 'Sfaturi verificate' },
          ].map((s, i) => (
            <div key={i} className="text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-100">
              <div className="font-display text-3xl md:text-4xl font-bold text-slate-900">{s.val}</div>
              <div className="text-xs md:text-sm text-slate-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips grouped by category */}
      {CATEGORIES.map((cat) => {
        const items = TIPS.filter(t => t.cat === cat.id)
        if (items.length === 0) return null
        return (
          <section key={cat.id} id={cat.id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                <cat.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">Categoria</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{cat.label}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {items.map((tip, i) => (
                <article key={i} className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-cyan-200 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                      <tip.Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 leading-tight mt-1">{tip.title}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">{tip.text}</p>
                  <ul className="space-y-2 pt-3 border-t border-slate-100">
                    {tip.bullets.map((b, k) => (
                      <li key={k} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <span className="text-cyan-500 flex-shrink-0 font-bold mt-0.5">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )
      })}

      {/* FAQ */}
      <section id="intrebari-frecvente" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-600">FAQ</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Întrebări frecvente</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-white border border-slate-200 rounded-xl p-5 group">
              <summary className="font-display font-bold text-slate-900 text-base cursor-pointer list-none flex items-center justify-between gap-3">
                <span>{f.q}</span>
                <span className="text-cyan-500 group-open:rotate-45 transition-transform text-2xl leading-none flex-shrink-0">+</span>
              </summary>
              <p className="text-slate-700 leading-relaxed mt-3 pt-3 border-t border-slate-100">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA to blog */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 md:p-10 text-white text-center shadow-xl">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">Gata să pui în practică aceste sfaturi?</h3>
          <p className="text-cyan-50 mb-6 max-w-xl mx-auto">
            Explorează ghidurile mele detaliate cu itinerarii testate pe destinații reale — Paris, Bali, Tokyo, Santorini și multe altele.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 bg-white text-cyan-700 hover:bg-cyan-50 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-xl transition-all">
            <Compass className="w-5 h-5" /> Vezi toate ghidurile
          </Link>
        </div>
      </section>

      <div className="pt-8 pb-4"><NewsletterCTA /></div>
    </>
  )
}
