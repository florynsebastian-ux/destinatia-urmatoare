import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Politica de Confidențialitate',
  description: 'Politica de confidențialitate Destinația Următoare - cum protejăm datele tale personale.',
}

export default function PrivacyPolicy() {
  const lastUpdate = '16 iunie 2026'
  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Shield className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-2">Politica de Confidențialitate</h1>
        <p className="text-slate-500">Ultima actualizare: {lastUpdate}</p>
      </div>

      <div className="prose-travel max-w-none space-y-6">
        <p>Bine ai venit pe <strong>Destinația Următoare</strong> (destinatiaurmatoare.eu). Confidențialitatea ta este importantă pentru noi. Această politică explică ce date colectăm, cum le folosim și care sunt drepturile tale conform GDPR.</p>

        <h2>1. Cine suntem</h2>
        <p>Site-ul <strong>destinatiaurmatoare.eu</strong> este operat de Andrei Munteanu, un blog personal de călătorii. Ne poți contacta la <a href="mailto:contact@destinatiaurmatoare.eu">contact@destinatiaurmatoare.eu</a>.</p>

        <h2>2. Ce date colectăm</h2>
        <ul>
          <li><strong>Newsletter:</strong> adresa de email (doar dacă te abonezi voluntar)</li>
          <li><strong>Formular contact:</strong> nume, email, mesaj (doar dacă ne scrii)</li>
          <li><strong>Comentarii:</strong> nume și mesaj public (doar dacă comentezi)</li>
          <li><strong>Cookies analitice:</strong> Google Analytics colectează date anonimizate despre navigare (pagini vizitate, durată, dispozitiv, țară)</li>
          <li><strong>Cookies publicitare:</strong> Google AdSense folosește cookies pentru a afișa reclame personalizate</li>
        </ul>

        <h2>3. Cum folosim datele</h2>
        <ul>
          <li>Pentru a-ți trimite newsletter-ul (dacă te-ai abonat)</li>
          <li>Pentru a-ți răspunde la mesaje</li>
          <li>Pentru a îmbunătăți conținutul site-ului pe baza statisticilor anonime</li>
          <li>Pentru a afișa reclame relevante (prin Google AdSense)</li>
        </ul>

        <h2>4. Cookies și tehnologii similare</h2>
        <p>Folosim cookies pentru:</p>
        <ul>
          <li><strong>Cookies esențiale</strong> — necesare pentru funcționarea site-ului</li>
          <li><strong>Google Analytics</strong> — statistici anonime (poți opta opt-out)</li>
          <li><strong>Google AdSense</strong> — reclame personalizate. Google și partenerii săi pot folosi cookies pentru a afișa reclame pe baza vizitelor tale anterioare pe acest site sau pe alte site-uri</li>
        </ul>
        <p>Pentru detalii suplimentare, citește <a href="/politica-cookies">Politica de Cookies</a>.</p>

        <h2>5. Linkuri afiliate</h2>
        <p>Unele articole conțin linkuri afiliate către parteneri precum <strong>Booking.com</strong>, <strong>GetYourGuide</strong>, <strong>Airalo</strong>. Dacă faci o achiziție prin aceste linkuri, primim o mică comisie, fără cost suplimentar pentru tine. Toate recomandările sunt obiective.</p>

        <h2>6. Cu cine partajăm datele</h2>
        <p>NU vindem și NU închiriem datele tale. Procesatori terți pe care îi folosim:</p>
        <ul>
          <li><strong>MongoDB Atlas</strong> — pentru baza de date (UE)</li>
          <li><strong>Vercel</strong> — pentru hosting (SUA, certificat GDPR)</li>
          <li><strong>Google</strong> — Analytics + AdSense (SUA, certificat GDPR)</li>
        </ul>

        <h2>7. Drepturile tale (GDPR)</h2>
        <p>Conform GDPR, ai dreptul:</p>
        <ul>
          <li>să ceri o copie a datelor tale</li>
          <li>să ceri ștergerea lor ("dreptul de a fi uitat")</li>
          <li>să te dezabonezi de la newsletter oricând</li>
          <li>să retragi consimțământul pentru cookies</li>
          <li>să faci plângere la ANSPDCP (autoritatea română de protecție a datelor)</li>
        </ul>
        <p>Pentru a-ți exercita oricare dintre aceste drepturi, scrie-ne la <a href="mailto:contact@destinatiaurmatoare.eu">contact@destinatiaurmatoare.eu</a>.</p>

        <h2>8. Cât timp păstrăm datele</h2>
        <ul>
          <li>Newsletter: până te dezabonezi</li>
          <li>Contact form: 2 ani</li>
          <li>Comentarii: pe perioada existenței site-ului</li>
          <li>Analytics: 26 luni (setarea Google Analytics)</li>
        </ul>

        <h2>9. Securitate</h2>
        <p>Folosim HTTPS pentru toate paginile, parole criptate pentru admin, și baze de date securizate. Cu toate acestea, niciun sistem nu este 100% sigur — îți recomandăm să nu trimiți date sensibile prin formularele noastre.</p>

        <h2>10. Modificări</h2>
        <p>Putem actualiza această politică. Modificările vor fi anunțate aici, cu data ultimei actualizări. Te încurajăm să verifici periodic.</p>

        <h2>11. Contact</h2>
        <p>Pentru orice întrebare despre confidențialitate: <a href="mailto:contact@destinatiaurmatoare.eu">contact@destinatiaurmatoare.eu</a></p>
      </div>
    </div>
  )
}
