import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Termeni și Condiții',
  description: 'Termenii și condițiile de utilizare ale site-ului Destinația Următoare.',
}

export default function Terms() {
  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <FileText className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-2">Termeni și Condiții</h1>
        <p className="text-slate-500">Ultima actualizare: 16 iunie 2026</p>
      </div>

      <div className="prose-travel max-w-none space-y-6">
        <p>Bine ai venit pe <strong>destinatiaurmatoare.eu</strong>. Prin accesarea și utilizarea acestui site, ești de acord cu următorii termeni și condiții. Te rugăm să-i citești cu atenție.</p>

        <h2>1. Despre site</h2>
        <p>Destinația Următoare este un blog personal de călătorii care oferă ghiduri, sfaturi și recomandări turistice. Conținutul reflectă experiențele personale ale autorului și are scop informativ.</p>

        <h2>2. Utilizarea conținutului</h2>
        <p>Tot conținutul (texte, imagini, design) este protejat de drepturi de autor și aparține Destinația Următoare, cu excepția:</p>
        <ul>
          <li>imaginilor licențiate sub Creative Commons sau de la Unsplash/Pexels</li>
          <li>citatelor cu atribuire la sursă</li>
        </ul>
        <p><strong>NU poți</strong>: copia, distribui, modifica sau republica conținutul fără permisiune scrisă. <strong>POȚI</strong>: cita un paragraf scurt cu link către articolul original.</p>

        <h2>3. Acuratețea informațiilor</h2>
        <p>Ne străduim să oferim informații exacte și actualizate. Cu toate acestea:</p>
        <ul>
          <li>Prețurile, programele și recomandările pot fi modificate fără preaviz</li>
          <li>Verifică întotdeauna datele oficiale (transport, vize, restaurante) înainte de călătorie</li>
          <li>Nu suntem răspunzători pentru pierderi cauzate de informații neactualizate</li>
        </ul>

        <h2>4. Linkuri afiliate și recomandări</h2>
        <p>Site-ul conține linkuri afiliate către parteneri precum Booking.com, GetYourGuide, Airalo etc. Dacă faci o achiziție prin aceste linkuri:</p>
        <ul>
          <li>Primim o mică comisie</li>
          <li>Tu NU plătești mai mult</li>
          <li>Recomandările rămân obiective și bazate pe experiență reală</li>
        </ul>

        <h2>5. Reclame Google AdSense</h2>
        <p>Acest site afișează reclame prin Google AdSense. Aceste reclame sunt gestionate de terți și nu reprezintă susținerea noastră a produselor/serviciilor afișate.</p>

        <h2>6. Comentariile utilizatorilor</h2>
        <p>Poți lăsa comentarii sub articole. Prin postare ești de acord că:</p>
        <ul>
          <li>Comentariul devine public</li>
          <li>Nu va conține spam, jigniri, conținut ilegal sau publicitar</li>
          <li>Putem modera sau șterge comentarii fără preaviz</li>
        </ul>

        <h2>7. Confidențialitate</h2>
        <p>Datele tale sunt protejate conform <a href="/politica-confidentialitate">Politicii de Confidențialitate</a>.</p>

        <h2>8. Limitare de răspundere</h2>
        <p>Conținutul este oferit "așa cum este". NU garantăm:</p>
        <ul>
          <li>Acuratețea sau actualitatea informațiilor</li>
          <li>Funcționarea continuă a site-ului</li>
          <li>Lipsa erorilor sau virușilor</li>
        </ul>
        <p>NU suntem răspunzători pentru decizii de călătorie luate pe baza informațiilor de pe site.</p>

        <h2>9. Linkuri externe</h2>
        <p>Site-ul conține linkuri către pagini externe. Nu controlăm conținutul acestora și nu suntem răspunzători pentru ele.</p>

        <h2>10. Modificări</h2>
        <p>Putem modifica acești termeni oricând. Continuarea utilizării site-ului după modificări înseamnă acceptarea noilor termeni.</p>

        <h2>11. Legea aplicabilă</h2>
        <p>Acești termeni sunt guvernați de legea română. Orice litigiu va fi soluționat de instanțele competente din România.</p>

        <h2>12. Contact</h2>
        <p>Întrebări? Scrie-ne la <a href="mailto:contact@destinatiaurmatoare.eu">contact@destinatiaurmatoare.eu</a>.</p>
      </div>
    </div>
  )
}
