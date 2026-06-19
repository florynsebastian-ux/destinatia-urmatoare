import { Cookie } from 'lucide-react'

export const metadata = {
  title: 'Politica de Cookies',
  description: 'Cum folosim cookies pe destinatiaurmatoare.eu',
}

export default function CookiePolicy() {
  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Cookie className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-2">Politica de Cookies</h1>
        <p className="text-slate-500">Ultima actualizare: 16 iunie 2026</p>
      </div>

      <div className="prose-travel max-w-none space-y-6">
        <h2>1. Ce sunt cookies?</h2>
        <p>Cookies sunt mici fișiere text salvate pe dispozitivul tău (calculator, telefon, tabletă) atunci când vizitezi un site web. Acestea ajută site-urile să funcționeze corect și să ofere o experiență mai bună.</p>

        <h2>2. Ce cookies folosim noi</h2>
        
        <h3>🔧 Cookies necesare (esențiale)</h3>
        <p>Sunt necesare pentru funcționarea site-ului. Nu pot fi dezactivate.</p>
        <ul>
          <li>Sesiune admin (pentru autentificare)</li>
          <li>Preferințe (consimțământ cookies)</li>
        </ul>

        <h3>📊 Cookies analitice (Google Analytics)</h3>
        <p>Ne ajută să înțelegem cum este folosit site-ul. Datele sunt anonimizate.</p>
        <ul>
          <li><code>_ga, _gid, _gat</code> — Google Analytics (durata: până la 2 ani)</li>
          <li>Ce colectează: pagini vizitate, durata, dispozitiv, browser, țară (NU date personale)</li>
        </ul>
        <p><strong>Poți opta opt-out</strong> instalând <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer noopener">Google Analytics Opt-out Add-on</a>.</p>

        <h3>📺 Cookies publicitare (Google AdSense)</h3>
        <p>Permit afișarea de reclame personalizate.</p>
        <ul>
          <li><code>__gads, __gpi, IDE</code> — Google AdSense</li>
          <li>Ce fac: afișează reclame relevante pentru tine, măsoară performanța lor</li>
          <li>Google și partenerii săi pot folosi cookies pentru a afișa reclame bazate pe vizitele tale anterioare pe acest site sau alte site-uri</li>
        </ul>
        <p>Poți gestiona preferințele de reclame la <a href="https://adssettings.google.com" target="_blank" rel="noreferrer noopener">Setări Reclame Google</a>.</p>

        <h2>3. Cookies de la terți</h2>
        <p>Site-ul folosește servicii care setează propriile cookies:</p>
        <ul>
          <li><strong>Google</strong> (Analytics, AdSense, Fonts)</li>
          <li><strong>YouTube</strong> (dacă încorporăm videoclipuri)</li>
          <li><strong>Booking.com, GetYourGuide</strong> (prin linkuri afiliate, când dai click)</li>
        </ul>

        <h2>4. Cum gestionezi cookies</h2>
        <p>Ai mai multe opțiuni:</p>
        <ul>
          <li><strong>Banner cookie consent:</strong> când intri prima dată pe site, alegi ce cookies accepți</li>
          <li><strong>Setări browser:</strong> poți bloca/șterge cookies din setările browser-ului (Chrome, Firefox, Safari, Edge)</li>
          <li><strong>Mod incognito:</strong> în acest mod cookies nu sunt salvate permanent</li>
        </ul>
        <p>⚠️ Atenție: blocarea anumitor cookies poate afecta funcționarea site-ului.</p>

        <h2>5. Modificări</h2>
        <p>Vom actualiza această politică când adăugăm noi servicii sau cookies. Verifică periodic.</p>

        <h2>6. Întrebări</h2>
        <p>Scrie-ne la <a href="mailto:contact@destinatiaurmatoare.eu">contact@destinatiaurmatoare.eu</a>.</p>
      </div>
    </div>
  )
}
