import { Link } from "@/i18n/routing"

export const metadata = {
  title: "Cookiebeleid | lctnships",
  description: "Lees hoe lcntships cookies en vergelijkbare technologieën gebruikt.",
}

const cookieTypes = [
  {
    title: "Noodzakelijke Cookies",
    icon: "verified_user",
    color: "blue",
    description:
      "Deze cookies zijn essentieel voor de basisfunctionaliteit van de website. Ze maken kernfuncties mogelijk zoals gebruikerslogin, accountbeheer en beveiliging. Zonder deze cookies kan de website niet goed functioneren.",
  },
  {
    title: "Analytische Cookies",
    icon: "analytics",
    color: "green",
    description:
      "We gebruiken deze om te zien hoe bezoekers de website gebruiken. Dit helpt ons onze diensten te verbeteren en de meest populaire studio-categorieën te identificeren. Alle gegevens zijn geanonimiseerd.",
  },
  {
    title: "Marketing Cookies",
    icon: "campaign",
    color: "purple",
    description:
      "Deze cookies worden gebruikt om advertenties relevanter te maken voor u en uw interesses. Ze voorkomen ook dat dezelfde advertentie constant verschijnt en helpen bij het meten van campagne-effectiviteit.",
  },
]

const cookieTable = [
  {
    name: "lcnt_session",
    provider: "lcntships",
    purpose: "Behouden van gebruikerssessie",
    expiry: "Sessie",
  },
  {
    name: "_ga",
    provider: "Google",
    purpose: "Gebruikersstatistieken meten",
    expiry: "2 jaar",
  },
  {
    name: "XSRF-TOKEN",
    provider: "lcntships",
    purpose: "Beveiliging tegen cross-site forgery",
    expiry: "Sessie",
  },
  {
    name: "sb-access-token",
    provider: "Supabase",
    purpose: "Authenticatie token",
    expiry: "1 uur",
  },
  {
    name: "sb-refresh-token",
    provider: "Supabase",
    purpose: "Token vernieuwing",
    expiry: "1 week",
  },
]

const tableOfContents = [
  { id: "inleiding", title: "Inleiding", icon: "info" },
  { id: "wat-zijn-cookies", title: "Wat zijn cookies?", icon: "cookie" },
  { id: "soorten-cookies", title: "Soorten cookies", icon: "layers" },
  { id: "beheer", title: "Beheer instellingen", icon: "settings" },
  { id: "overzicht", title: "Cookie overzicht", icon: "list_alt" },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-12 border-b border-[#e7ebf3] mb-6 sm:mb-12">
          <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
            <h1 className="text-[#0d121b] text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Cookiebeleid
            </h1>
            <p className="text-[#4c669a] text-sm sm:text-lg font-medium">
              Laatst bijgewerkt op 24 januari 2025
            </p>
          </div>
          <button className="flex min-w-0 sm:min-w-[200px] cursor-pointer items-center justify-center rounded-full h-11 sm:h-14 px-5 sm:px-8 bg-black text-white text-sm sm:text-base font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform">
            <span className="truncate">Beheer Cookie-instellingen</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-full lg:w-72 shrink-0">
            <div className="sticky top-8 flex flex-col gap-6 p-6 rounded-lg bg-white border border-[#e7ebf3]">
              <div className="flex flex-col">
                <h3 className="text-[#0d121b] text-base font-bold">Inhoudsopgave</h3>
                <p className="text-[#4c669a] text-xs font-normal">Navigeer door het beleid</p>
              </div>
              <nav className="flex flex-col gap-2">
                {tableOfContents.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-colors ${
                      index === 0
                        ? "bg-gray-100 text-black"
                        : "hover:bg-gray-100 text-[#0d121b]"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        index === 0 ? "font-bold" : "text-gray-400"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <p className={`text-sm ${index === 0 ? "font-bold" : "font-medium"}`}>
                      {item.title}
                    </p>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-8 sm:space-y-12 max-w-3xl">
            {/* Introduction */}
            <section id="inleiding">
              <h2 className="text-2xl sm:text-3xl font-extrabold pb-3 sm:pb-4 text-[#0d121b]">Inleiding</h2>
              <p className="text-[#4c669a] text-sm sm:text-lg leading-relaxed">
                Bij lcntships streven we naar volledige transparantie over hoe we uw gegevens
                gebruiken. Deze pagina legt uit hoe we cookies en vergelijkbare technologieën
                gebruiken op ons platform om de ultieme studio-boekingservaring te bieden.
              </p>
            </section>

            {/* What are cookies */}
            <section id="wat-zijn-cookies">
              <h2 className="text-xl sm:text-2xl font-bold pb-3 sm:pb-4 text-[#0d121b] flex items-center gap-2">
                <span className="material-symbols-outlined text-black">cookie</span>
                Wat zijn cookies?
              </h2>
              <p className="text-[#4c669a] text-sm sm:text-base leading-relaxed">
                Cookies zijn kleine tekstbestanden die op uw computer of mobiele apparaat worden
                opgeslagen wanneer u onze website bezoekt. Ze helpen ons om de website naar behoren
                te laten functioneren, uw voorkeuren te onthouden en uw ervaring te verbeteren door
                te begrijpen hoe de site wordt gebruikt.
              </p>
            </section>

            {/* Types of cookies */}
            <section id="soorten-cookies" className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0d121b]">Soorten cookies die wij gebruiken</h2>
              <div className="grid gap-4 sm:gap-6">
                {cookieTypes.map((cookie) => (
                  <div
                    key={cookie.title}
                    className="p-4 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-[#e7ebf3]"
                  >
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          cookie.color === "blue"
                            ? "bg-blue-50 text-black"
                            : cookie.color === "green"
                            ? "bg-green-50 text-green-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        <span className="material-symbols-outlined">{cookie.icon}</span>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold">{cookie.title}</h3>
                    </div>
                    <p className="text-[#4c669a] leading-relaxed">{cookie.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Cookie Overview Table */}
            <section id="overzicht">
              <h2 className="text-xl sm:text-2xl font-bold pb-4 sm:pb-6 text-[#0d121b]">Gedetailleerd Cookie Overzicht</h2>
              {/* Mobile: Card layout */}
              <div className="sm:hidden space-y-3">
                {cookieTable.map((cookie) => (
                  <div key={cookie.name} className="bg-white rounded-xl border border-[#e7ebf3] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold text-black">{cookie.name}</span>
                      <span className="text-xs text-[#4c669a] bg-gray-50 px-2 py-0.5 rounded-full">{cookie.expiry}</span>
                    </div>
                    <p className="text-xs text-[#4c669a]">{cookie.purpose}</p>
                    <p className="text-xs text-gray-400">Provider: {cookie.provider}</p>
                  </div>
                ))}
              </div>
              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-hidden border border-[#e7ebf3] rounded-lg">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-sm font-bold text-[#0d121b]">Naam</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#0d121b]">Provider</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#0d121b]">Doel</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#0d121b]">Verval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7ebf3]">
                    {cookieTable.map((cookie) => (
                      <tr key={cookie.name}>
                        <td className="px-6 py-4 text-sm font-mono text-black">{cookie.name}</td>
                        <td className="px-6 py-4 text-sm text-[#4c669a]">{cookie.provider}</td>
                        <td className="px-6 py-4 text-sm text-[#4c669a]">{cookie.purpose}</td>
                        <td className="px-6 py-4 text-sm text-[#4c669a]">{cookie.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Manage Settings */}
            <section id="beheer" className="pb-10 sm:pb-20">
              <div className="bg-gray-100 rounded-lg p-5 sm:p-10 border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold pb-3 sm:pb-4 text-[#0d121b]">
                  Hoe beheer ik mijn instellingen?
                </h2>
                <p className="text-[#4c669a] text-sm sm:text-base leading-relaxed mb-5 sm:mb-8">
                  U kunt uw cookievoorkeuren op elk moment wijzigen via onze on-site tool of via uw
                  browserinstellingen. Houd er rekening mee dat het uitschakelen van sommige cookies
                  invloed kan hebben op de functionaliteit van onze studio-portal.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-black text-white font-bold rounded-full hover:shadow-lg transition-all">
                    Open Voorkeuren Center
                  </button>
                  <button className="px-6 py-3 bg-white border border-[#e7ebf3] text-[#0d121b] font-bold rounded-full hover:bg-gray-50 transition-all">
                    Browser Gids bekijken
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
