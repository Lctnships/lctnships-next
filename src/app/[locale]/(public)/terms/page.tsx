import { Link } from "@/i18n/routing"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Algemene Voorwaarden - lcntships",
  description: "Algemene Voorwaarden van lcntships - het platform voor creatieve studio verhuur",
}

const sections = [
  { id: "definities", icon: "info", title: "1. Definities" },
  { id: "toepasselijkheid", icon: "gavel", title: "2. Toepasselijkheid" },
  { id: "account", icon: "person_add", title: "3. Account aanmaken" },
  { id: "boekingen", icon: "payments", title: "4. Boekingen & Betalingen" },
  { id: "annuleren", icon: "event_busy", title: "5. Annuleringsbeleid" },
  { id: "gebruiksregels", icon: "meeting_room", title: "6. Gebruiksregels Studio" },
  { id: "aansprakelijkheid", icon: "security", title: "7. Aansprakelijkheid" },
]

export default function TermsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-gray-900">Algemene Voorwaarden</span>
      </nav>

      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-12">
        <div className="flex flex-col gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">Algemene Voorwaarden</h1>
          <p className="text-gray-500 text-sm sm:text-lg">Laatst bijgewerkt: 24 januari 2025</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 rounded-xl h-11 sm:h-12 px-5 sm:px-6 font-bold shadow-sm transition-all group text-sm sm:text-base">
          <span className="material-symbols-outlined text-black">print</span>
          <span>Print PDF</span>
        </button>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sticky Sidebar */}
        <aside className="hidden lg:block lg:w-72 flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Inhoudsopgave</h3>
              <p className="text-sm text-gray-500">Navigeer door de voorwaarden</p>
            </div>
            <nav className="flex flex-col gap-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    index === 0
                      ? "bg-gray-100 text-black font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{section.icon}</span>
                  <span className="text-sm">{section.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Legal Content Section */}
        <div className="flex-1 max-w-3xl bg-white p-4 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
          <div className="prose prose-slate prose-lg max-w-none">
            {/* Section 1: Definities */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="definities">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">1. Definities</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In deze Algemene Voorwaarden wordt verstaan onder:
              </p>
              <ul className="space-y-4 text-gray-600 list-none p-0">
                <li className="flex gap-4">
                  <span className="font-bold text-black min-w-[80px] sm:min-w-[100px]">lcntships:</span>
                  <span>Het online platform dat bemiddelt tussen verhuurders van creatieve ruimtes en huurders.</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold text-black min-w-[80px] sm:min-w-[100px]">Studio:</span>
                  <span>De creatieve werkruimte die via het platform wordt aangeboden voor tijdelijk gebruik.</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold text-black min-w-[80px] sm:min-w-[100px]">Huurder:</span>
                  <span>De natuurlijke persoon of rechtspersoon die een boeking plaatst via lcntships.</span>
                </li>
              </ul>
            </section>

            {/* Section 2: Toepasselijkheid */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="toepasselijkheid">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">2. Toepasselijkheid</h2>
              <p className="text-gray-600 leading-relaxed">
                Deze voorwaarden zijn van toepassing op elk aanbod van lcntships en op elke tot stand gekomen overeenkomst tussen lcntships en de gebruiker. Door gebruik te maken van het platform stemt u uitdrukkelijk in met deze voorwaarden.
              </p>
            </section>

            {/* Section 3: Account */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="account">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">3. Account aanmaken</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Om gebruik te maken van onze diensten dient u een account aan te maken. Hierbij gelden de volgende regels:
              </p>
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <span className="material-symbols-outlined text-black mt-1">check_circle</span>
                  <p className="text-gray-600">U dient minimaal 18 jaar oud te zijn om een account aan te maken en boekingen te verrichten.</p>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <span className="material-symbols-outlined text-black mt-1">verified_user</span>
                  <p className="text-gray-600">De verstrekte informatie bij registratie dient naar waarheid en volledig te zijn.</p>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <span className="material-symbols-outlined text-black mt-1">lock</span>
                  <p className="text-gray-600">U bent zelf verantwoordelijk voor het geheimhouden van uw inloggegevens.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Boekingen */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="boekingen">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">4. Boekingen & Betalingen</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Een boeking is pas definitief nadat lcntships de betaling heeft ontvangen en de verhuurder de aanvraag heeft bevestigd. Alle prijzen op het platform zijn inclusief BTW, tenzij anders vermeld.
              </p>
              <div className="border-l-4 border-black pl-6 py-2 my-6">
                <p className="font-medium italic">
                  &quot;Wij maken gebruik van beveiligde betalingsproviders om uw transacties te beschermen. lcntships slaat zelf geen creditcardgegevens op.&quot;
                </p>
              </div>
            </section>

            {/* Section 5: Annuleren */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="annuleren">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">5. Annuleringsbeleid</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Wij hanteren drie niveaus van annuleringsvoorwaarden, die per studio kunnen verschillen:
              </p>
              <div className="space-y-4">
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold text-lg mb-2 text-green-600">Flexibel</h4>
                  <p className="text-sm text-gray-500">Volledige restitutie bij annulering tot 24 uur voor aanvang.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold text-lg mb-2 text-yellow-600">Gemiddeld</h4>
                  <p className="text-sm text-gray-500">50% restitutie bij annulering tussen 7 dagen en 48 uur voor aanvang.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold text-lg mb-2 text-red-600">Strikt</h4>
                  <p className="text-sm text-gray-500">Geen restitutie bij annulering binnen 7 dagen voor aanvang.</p>
                </div>
              </div>
            </section>

            {/* Section 6: Gebruiksregels */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="gebruiksregels">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">6. Gebruiksregels Studio</h2>
              <p className="text-gray-600 leading-relaxed">
                De huurder verbindt zich ertoe de gehuurde ruimte als een &apos;goed huisvader&apos; te gebruiken. Dit houdt in dat de ruimte in oorspronkelijke staat wordt achtergelaten, apparatuur met zorg wordt behandeld en eventuele schade direct wordt gemeld aan de verhuurder en lcntships.
              </p>
            </section>

            {/* Section 7: Aansprakelijkheid */}
            <section className="scroll-mt-24 mb-8 sm:mb-16" id="aansprakelijkheid">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">7. Aansprakelijkheid</h2>
              <p className="text-gray-600 leading-relaxed">
                lcntships faciliteert enkel het platform en is niet aansprakelijk voor schade ontstaan tijdens het gebruik van een studio, noch voor geschillen tussen huurder en verhuurder. Gebruikers wordt geadviseerd een passende bedrijfsaansprakelijkheidsverzekering af te sluiten.
              </p>
            </section>
          </div>

        </div>
      </div>
    </main>
  )
}
