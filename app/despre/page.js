import Image from 'next/image'
import { MapPin, Plane, Camera, Award } from 'lucide-react'
import NewsletterCTA from '@/components/newsletter-cta'

export const metadata = { title: 'Despre mine', description: 'Povestea autorului și pasiunea pentru călătorii' }

export default function Despre() {
  return (
    <div className="pt-32 pb-20">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-block bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">Salut!</div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Eu sunt <span className="gradient-text">Andrei</span>
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              Acum 8 ani am părăsit jobul corporate și am pornit cu rucsacul în spate să văd lumea.
              De-atunci, am vizitat 47 de țări, am scris peste 200 de articole și am învățat
              că magia călătoriei nu stă în destinație, ci în drum.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              Pe Următoarea Destinație public ghiduri testate personal, recomandări reale și sfaturi care
              ți-au schimbat realmente călătoriile. Fără sponsorizări ascunse, fără clișee.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: Plane, val: '47', lbl: 'Țări' },
                { Icon: Camera, val: '200+', lbl: 'Articole' },
                { Icon: Award, val: '8 ani', lbl: 'Travel' },
              ].map(({ Icon, val, lbl }) => (
                <div key={lbl} className="text-center p-4 bg-cyan-50 rounded-xl">
                  <Icon className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                  <div className="font-display text-2xl font-bold text-slate-900">{val}</div>
                  <div className="text-xs text-slate-500">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200" alt="Andrei" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Filosofia mea de călătorie</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Slow travel', text: 'Mai bine o lună într-un loc decât 10 orașe în 2 săptămâni.', emoji: '🐢' },
            { title: 'Local first', text: 'Mâncăm unde mănâncă locals, dormim în cartierele lor.', emoji: '🏡' },
            { title: 'Off-the-beaten-path', text: 'Căutăm experiențe autentice, nu Instagram spots.', emoji: '🗺️' },
          ].map((v) => (
            <div key={v.title} className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="text-4xl mb-3">{v.emoji}</div>
              <h3 className="font-display text-xl font-bold mb-2">{v.title}</h3>
              <p className="text-slate-600">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-24"><NewsletterCTA /></div>
    </div>
  )
}
