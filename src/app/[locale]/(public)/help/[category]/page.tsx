import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

// Help category data — content that would typically come from a CMS
const categoryData: Record<string, {
  title: string
  description: string
  icon: string
  sections: {
    title: string
    icon: string
    articles: { title: string; slug: string }[]
  }[]
}> = {
  "booking-payments": {
    title: "Boekingen & Betalingen",
    description: "Beheer je facturen, restituties en betaalmethoden veilig.",
    icon: "credit_card",
    sections: [
      {
        title: "Facturen & Bonnen",
        icon: "receipt_long",
        articles: [
          { title: "Hoe je facturen beheert en downloadt", slug: "manage-invoices" },
          { title: "Restitutietijdlijnen begrijpen", slug: "refund-timelines" },
          { title: "Je betaalmethode wijzigen", slug: "change-payment-method" },
          { title: "Hoe je projectkortingen toepast", slug: "apply-discounts" },
        ],
      },
      {
        title: "Betalingsproblemen",
        icon: "error",
        articles: [
          { title: "Betaling geweigerd - wat te doen", slug: "payment-declined" },
          { title: "Dubbele afschrijvingen uitgelegd", slug: "duplicate-charges" },
          { title: "Valutaconversiekosten", slug: "currency-fees" },
        ],
      },
    ],
  },
  "renters": {
    title: "Voor Huurders",
    description: "Alles wat je moet weten over het vinden en huren van de perfecte studio.",
    icon: "person",
    sections: [
      {
        title: "Studio's Vinden",
        icon: "search",
        articles: [
          { title: "Hoe je de perfecte studio zoekt", slug: "search-studios" },
          { title: "Filters effectief gebruiken", slug: "using-filters" },
          { title: "Studiobeoordelingen begrijpen", slug: "studio-ratings" },
        ],
      },
      {
        title: "Boekingsproces",
        icon: "calendar_today",
        articles: [
          { title: "Je eerste boeking maken", slug: "first-booking" },
          { title: "Meerdere dagen boeken", slug: "multi-day-booking" },
          { title: "Wat te verwachten bij aankomst", slug: "arrival-guide" },
        ],
      },
    ],
  },
  "hosts": {
    title: "Voor Verhuurders",
    description: "Tips en tools voor studio-eigenaren om zichtbaarheid en boekingen te maximaliseren.",
    icon: "storefront",
    sections: [
      {
        title: "Je vermelding instellen",
        icon: "add_business",
        articles: [
          { title: "Hoe je de beste foto's van je ruimte maakt", slug: "best-photos" },
          { title: "Je apparatuur en voorzieningen beschrijven", slug: "describe-equipment" },
          { title: "Verificatievereisten voor nieuwe verhuurders", slug: "verification" },
          { title: "Je uur- en dagtarieven instellen", slug: "set-rates" },
        ],
      },
      {
        title: "Beschikbaarheid beheren",
        icon: "calendar_month",
        articles: [
          { title: "Je externe agenda's synchroniseren (iCal)", slug: "sync-calendar" },
          { title: "Minimale boekingsuren instellen", slug: "minimum-hours" },
          { title: "Hoe je last-minute verzoeken afhandelt", slug: "last-minute" },
          { title: "Datums blokkeren voor onderhoud", slug: "block-dates" },
        ],
      },
      {
        title: "Uitbetalingen & Inkomsten",
        icon: "payments",
        articles: [
          { title: "Onze servicekosten voor verhuurders begrijpen", slug: "service-fees" },
          { title: "Wanneer en hoe je betaald wordt", slug: "payout-schedule" },
          { title: "Je belastinggegevens bijwerken", slug: "tax-info" },
          { title: "Je maandelijkse inkomstenrapport downloaden", slug: "earnings-report" },
        ],
      },
    ],
  },
  "account": {
    title: "Account & Instellingen",
    description: "Werk je profiel bij, wijzig wachtwoorden en beheer voorkeuren.",
    icon: "settings",
    sections: [
      {
        title: "Profielbeheer",
        icon: "person",
        articles: [
          { title: "Hoe je je profielfoto wijzigt", slug: "change-photo" },
          { title: "Je persoonlijke bio bijwerken", slug: "update-bio" },
          { title: "Social media-accounts koppelen", slug: "link-social" },
        ],
      },
      {
        title: "Beveiliging & Wachtwoorden",
        icon: "shield",
        articles: [
          { title: "Tweefactorauthenticatie instellen", slug: "two-factor" },
          { title: "Een vergeten wachtwoord opnieuw instellen", slug: "reset-password" },
          { title: "Actieve inlogsessies bekijken", slug: "active-sessions" },
        ],
      },
    ],
  },
  "projects": {
    title: "Projecten",
    description: "Organiseer je creatieve workflows en teamsamenwerking.",
    icon: "folder_open",
    sections: [
      {
        title: "Workflows Beheren",
        icon: "account_tree",
        articles: [
          { title: "Hoe je een nieuw project aanmaakt en structureert", slug: "create-project" },
          { title: "Projectstatussen gebruiken om voortgang bij te houden", slug: "project-statuses" },
          { title: "Archiveren vs. verwijderen van projecten", slug: "archive-delete" },
        ],
      },
      {
        title: "Samenwerken met Teamleden",
        icon: "group",
        articles: [
          { title: "Teamleden uitnodigen voor je studio-werkruimte", slug: "invite-team" },
          { title: "Rollen en rechten beheren", slug: "roles-permissions" },
        ],
      },
    ],
  },
  "cancellations": {
    title: "Annuleringen & Restituties",
    description: "Begrijp het restitutiebeleid en hoe je boekingen kunt annuleren of verplaatsen.",
    icon: "cancel",
    sections: [
      {
        title: "Annuleringsbeleid voor Huurders",
        icon: "person_cancel",
        articles: [
          { title: "Hoe je een studioboeking annuleert", slug: "cancel-booking" },
          { title: "Het 24-uurs restitutievenster begrijpen", slug: "refund-window" },
          { title: "Annuleringskosten voor langetermijnhuur", slug: "long-term-fees" },
        ],
      },
      {
        title: "Restitutieproces",
        icon: "payments",
        articles: [
          { title: "De status van je restitutie volgen", slug: "track-refund" },
          { title: "Gedeeltelijke restituties bij technische problemen", slug: "partial-refunds" },
        ],
      },
    ],
  },
}

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params
  const data = categoryData[category]
  const t = await getTranslations("Help")
  if (!data) return { title: t("helpCenter") }

  return {
    title: `${data.title} | lctnships`,
    description: data.description,
  }
}

export default async function HelpCategoryPage({ params }: PageProps) {
  const { category } = await params
  const data = categoryData[category]
  const t = await getTranslations("Help")

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-0 mt-12 mb-10">
        <nav className="flex items-center gap-2 text-[#4c669a] text-xs font-semibold mb-6 uppercase tracking-wider">
          <Link href="/help" className="hover:text-primary transition-colors">
            {t("helpCenter")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0d121b]">{data.title}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#e7ebf3] pb-10">
          <div className="flex items-start gap-6">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-4xl">{data.icon}</span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[#0d121b] text-4xl md:text-5xl font-extrabold tracking-tight">
                {data.title}
              </h1>
              <p className="text-[#4c669a] text-lg max-w-xl">{data.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-0 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {data.sections.map((section) => (
            <section key={section.title} className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">{section.icon}</span>
                <h2 className="text-xl font-extrabold text-[#0d121b]">{section.title}</h2>
              </div>
              <div className="flex flex-col gap-4">
                {section.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/help/${category}/${article.slug}`}
                    className="group flex items-center justify-between py-1 text-[#4c669a] hover:text-primary transition-all"
                  >
                    <span className="text-base font-medium">{article.title}</span>
                    <span className="material-symbols-outlined text-xl opacity-0 group-hover:opacity-100 transition-all">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Still need help */}
      <div className="w-full bg-white border-y border-[#e7ebf3] py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">{t("stillNeedHelp")}</h3>
          <p className="text-[#4c669a] mb-8">
            {t("supportAvailable")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              {t("contactUs")}
            </button>
            <Link
              href="/help"
              className="bg-white text-[#0d121b] border border-[#e7ebf3] font-bold px-8 py-3 rounded-xl hover:bg-[#f6f6f8] transition-all"
            >
              {t("backToHelpCenter")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
