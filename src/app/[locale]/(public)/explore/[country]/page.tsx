import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ country: string }>
}

// Country data — content that would typically come from a CMS
const countryData: Record<string, {
  name: string
  heroTitle: string
  heroDescription: string
  heroImage: string
  cities: {
    name: string
    studioCount: string
    image: string
    slug: string
  }[]
  topStudios: {
    id: string
    title: string
    location: string
    pricePerHour: number
    rating: number
    reviewCount: number
    image: string
    tags: string[]
  }[]
  trends: {
    type: "large" | "medium" | "small" | "highlight"
    title: string
    description?: string
    image?: string
    tag?: string
    icon?: string
    stat?: string
  }[]
}> = {
  netherlands: {
    name: "Nederland",
    heroTitle: "Creëer in Nederland",
    heroDescription: "Ontdek de beste creatieve ruimtes van de Amsterdamse grachten tot de moderne architectuur van Rotterdam en verder.",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvF8nE2l55sI26ZzFEi89XkFauQZ-l387xLD-DPGjpWo4dVmeSOTdhi9UawfX00aJoOro9TBl-8jl2yJ0zsAPYBxS_Ds9GtQr_LnQh37wQ-64ro91iOf1s2W7rPEVGdmiqe5nKpaUKYX3SuXlWlRCL3ocG53Y0vltPya2F5DyA9m-UpFqq6Mfh-3Et7MVZrNNtE643KsIlyO-4oAddJG0SxvB-hV6EVNgrUWqJhcUh2EbSbCCxqTFKR9Wd7kn_M3hZgt_Tn4OVJPo",
    cities: [
      {
        name: "Amsterdam",
        studioCount: "240+",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvF8nE2l55sI26ZzFEi89XkFauQZ-l387xLD-DPGjpWo4dVmeSOTdhi9UawfX00aJoOro9TBl-8jl2yJ0zsAPYBxS_Ds9GtQr_LnQh37wQ-64ro91iOf1s2W7rPEVGdmiqe5nKpaUKYX3SuXlWlRCL3ocG53Y0vltPya2F5DyA9m-UpFqq6Mfh-3Et7MVZrNNtE643KsIlyO-4oAddJG0SxvB-hV6EVNgrUWqJhcUh2EbSbCCxqTFKR9Wd7kn_M3hZgt_Tn4OVJPo",
        slug: "amsterdam",
      },
      {
        name: "Rotterdam",
        studioCount: "150+",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGY6gAjdDNpT0CnME8OxZZTXDRkO17V_QnawT4dh6OS_13Kg4PMUujCZgLL_QJTJfwo1Cg50qRvsuNHWJCo6lbsHY5aE9R5Gw-Rh0eCnfy2F4G3jtm6_yxYDpHMMyWWQF00p4MHKMFLIzwy0Hr-aOoRFqih-MMtgcRa3vw57gLn__bEdJuq6V6c2oE5F4_KJbTGMidWLEH8zoyQXpybSEtpYCcd4Xx92-Ryx8BPdpBueyQcA00mIN061T6zWx-Ra3u8xYj7Qw2Ptw",
        slug: "rotterdam",
      },
      {
        name: "Utrecht",
        studioCount: "80+",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXDgOULlRndhIzH2VeDXVK4_o-NM9knZlwGV9siKHlnmiA4EFToCQfgBbHbGSdl1O9vqbTfIo-T0AeyE90QTs3aEv1Ww46kpKWeRhn1o1k4XDwQpbqR013krpXXlfLe4IVQik2k2rTIFFQPD9DsU5nK8mIj_AIN2DlYkF4I1DHjvFSWAIuBEwPBIh8IxCCo7kgBRaXYyZkLTLaL3mOpY9EQZ3gz2ilRM5sFw5yjfBIdwMzvprHs_Me1941-yQ42VDUnDKwM4d2uD8",
        slug: "utrecht",
      },
      {
        name: "Eindhoven",
        studioCount: "60+",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        slug: "eindhoven",
      },
    ],
    topStudios: [
      {
        id: "mock-1",
        title: "The Sonic Haven",
        location: "Amsterdam, Jordaan District",
        pricePerHour: 45,
        rating: 4.9,
        reviewCount: 124,
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        tags: ["Music", "Podcast"],
      },
      {
        id: "mock-2",
        title: "Glass House Photo",
        location: "Rotterdam, Kop van Zuid",
        pricePerHour: 65,
        rating: 5.0,
        reviewCount: 89,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        tags: ["Photography", "Event"],
      },
      {
        id: "mock-3",
        title: "Industrial Lab",
        location: "Eindhoven, Strijp-S",
        pricePerHour: 30,
        rating: 4.8,
        reviewCount: 210,
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        tags: ["Design", "Workshop"],
      },
    ],
    trends: [
      {
        type: "large",
        title: "De Opkomst van Podcast Studio's in Amsterdam",
        description: "Waarom de hoofdstad het wereldwijde centrum wordt voor digitale audiocreators en visuele storytelling.",
        image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200",
        tag: "TRENDING",
      },
      {
        type: "medium",
        title: "Duurzame Hubs in Utrecht",
        description: "Ontdek creatieve ruimtes gebouwd met een 100% circulaire economie aanpak in het hart van Utrecht.",
        icon: "eco",
        stat: "12 nieuwe ruimtes deze maand",
      },
      {
        type: "small",
        title: "Strijp-S Boom",
        description: "Hoe het industriële district van Eindhoven is getransformeerd tot de designhoofdstad van het land.",
      },
      {
        type: "highlight",
        title: "Workation Plekken",
        image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600",
      },
    ],
  },
  germany: {
    name: "Duitsland",
    heroTitle: "Creëer in Duitsland",
    heroDescription: "Van de bruisende kunstscene in Berlijn tot de precisie-studio's in München, vind jouw creatieve thuis.",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6ds4i4IDFQHlLQq0rQACFwHwtzd5N7_dtWNonXQ7V-gOn8SiyLcno2OzzYku0m2DZRyRqUQYnwn09sWsAfxBzNbQ1GyuQIpMSCrkJuRsfi80UkvtuwdaUJnJZb5Zpw_kxv87wFZEsuFPHThGE0KFHgWWt1mrY9ChwOlnDwwgBBPoSw2LbU6uvYICQsXQazUpneJryAVKNxeSPuNSZ5qKLBXHhXw6XzfJWfNtjlPLEDjDibFoZ69pw0MAjZzgAk2DVzBhbMEwJf2k",
    cities: [
      {
        name: "Berlin",
        studioCount: "320+",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6ds4i4IDFQHlLQq0rQACFwHwtzd5N7_dtWNonXQ7V-gOn8SiyLcno2OzzYku0m2DZRyRqUQYnwn09sWsAfxBzNbQ1GyuQIpMSCrkJuRsfi80UkvtuwdaUJnJZb5Zpw_kxv87wFZEsuFPHThGE0KFHgWWt1mrY9ChwOlnDwwgBBPoSw2LbU6uvYICQsXQazUpneJryAVKNxeSPuNSZ5qKLBXHhXw6XzfJWfNtjlPLEDjDibFoZ69pw0MAjZzgAk2DVzBhbMEwJf2k",
        slug: "berlin",
      },
      {
        name: "München",
        studioCount: "180+",
        image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800",
        slug: "munich",
      },
      {
        name: "Hamburg",
        studioCount: "120+",
        image: "https://images.unsplash.com/photo-1566404791232-af9fe43d602c?w=800",
        slug: "hamburg",
      },
      {
        name: "Keulen",
        studioCount: "90+",
        image: "https://images.unsplash.com/photo-1567621225293-4cc7e78b8e96?w=800",
        slug: "cologne",
      },
    ],
    topStudios: [
      {
        id: "mock-de-1",
        title: "Kreuzberg Loft",
        location: "Berlin, Kreuzberg",
        pricePerHour: 55,
        rating: 4.9,
        reviewCount: 156,
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        tags: ["Photography", "Film"],
      },
      {
        id: "mock-de-2",
        title: "Sound Factory",
        location: "Munich, Maxvorstadt",
        pricePerHour: 75,
        rating: 4.8,
        reviewCount: 98,
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        tags: ["Music", "Recording"],
      },
      {
        id: "mock-de-3",
        title: "Harbor View Studio",
        location: "Hamburg, HafenCity",
        pricePerHour: 40,
        rating: 4.7,
        reviewCount: 134,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        tags: ["Content", "Podcast"],
      },
    ],
    trends: [
      {
        type: "large",
        title: "De Underground Studioscene van Berlijn",
        description: "Ontdek verborgen creatieve pareltjes in omgebouwde industriële ruimtes door de hele stad.",
        image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200",
        tag: "TRENDING",
      },
      {
        type: "medium",
        title: "Tech Ontmoet Creativiteit in München",
        description: "Hoe de techhub van Beieren een nieuwe golf van digitale contentcreators stimuleert.",
        icon: "devices",
        stat: "25 nieuwe tech-studio's",
      },
      {
        type: "small",
        title: "Hamburg Media Mile",
        description: "De creatieve corridor van de stad breidt zich uit met nieuwe studio-openingen.",
      },
      {
        type: "highlight",
        title: "Co-working Studio's",
        image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600",
      },
    ],
  },
  france: {
    name: "Frankrijk",
    heroTitle: "Creëer in Frankrijk",
    heroDescription: "Van Parijse elegantie tot de mediterrane sfeer van Marseille, laat je creativiteit los.",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqCDQVaCn0iMoXpwpUd52gHNynqn-KaKSnxIY-FeCNnxpQu3F5GPfSjUg2eeo4BW0pT8fJaQTq6qn4iLRmQvCr7sup8LGTiX2teDpa-wY9jM-RCCJPisDEf3hK7gb-jtDREAsjvVDVoABICwZQibzAInLWrwbUZyVTjlUrWsidOJQh_6rFuV0QyFNZLl3PG3CTU-KX6o6_Ye1MUwDiLqYnfFJORiBhF008kaVVp6rhHbdg0dazwRrsz2rkVnIQPiLOS2c2SVbAZA",
    cities: [
      {
        name: "Parijs",
        studioCount: "280+",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqCDQVaCn0iMoXpwpUd52gHNynqn-KaKSnxIY-FeCNnxpQu3F5GPfSjUg2eeo4BW0pT8fJaQTq6qn4iLRmQvCr7sup8LGTiX2teDpa-wY9jM-RCCJPisDEf3hK7gb-jtDREAsjvVDVoABICwZQibzAInLWrwbUZyVTjlUrWsidOJQh_6rFuV0QyFNZLl3PG3CTU-KX6o6_Ye1MUwDiLqYnfFJORiBhF008kaVVp6rhHbdg0dazwRrsz2rkVnIQPiLOS2c2SVbAZA",
        slug: "paris",
      },
      {
        name: "Lyon",
        studioCount: "95+",
        image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800",
        slug: "lyon",
      },
      {
        name: "Marseille",
        studioCount: "70+",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800",
        slug: "marseille",
      },
      {
        name: "Bordeaux",
        studioCount: "55+",
        image: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800",
        slug: "bordeaux",
      },
    ],
    topStudios: [
      {
        id: "mock-fr-1",
        title: "Le Marais Studio",
        location: "Paris, Le Marais",
        pricePerHour: 85,
        rating: 4.9,
        reviewCount: 203,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        tags: ["Fashion", "Photography"],
      },
      {
        id: "mock-fr-2",
        title: "Atelier Lumière",
        location: "Lyon, Presqu'île",
        pricePerHour: 55,
        rating: 4.8,
        reviewCount: 87,
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        tags: ["Art", "Workshop"],
      },
      {
        id: "mock-fr-3",
        title: "Mediterranean Dreams",
        location: "Marseille, Vieux-Port",
        pricePerHour: 45,
        rating: 4.7,
        reviewCount: 112,
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        tags: ["Video", "Content"],
      },
    ],
    trends: [
      {
        type: "large",
        title: "Parijs Fashion Week Studio's",
        description: "Achter de schermen van de meest gewilde ruimtes tijdens de modemaand.",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
        tag: "TRENDING",
      },
      {
        type: "medium",
        title: "De Creatieve Renaissance van Lyon",
        description: "De op één na grootste stad van Frankrijk wordt een hotspot voor onafhankelijke creators.",
        icon: "palette",
        stat: "40% groei in boekingen",
      },
      {
        type: "small",
        title: "Marseille in Opkomst",
        description: "Het mediterrane licht trekt fotografen van over de hele wereld aan.",
      },
      {
        type: "highlight",
        title: "Historische Studio's",
        image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600",
      },
    ],
  },
  "united-kingdom": {
    name: "Verenigd Koninkrijk",
    heroTitle: "Creëer in het Verenigd Koninkrijk",
    heroDescription: "Van de creatieve energie van Londen tot de indiespirit van Manchester, vind jouw studio.",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuALoyOmI2-Qvwq8nY4DhEUtHPwodfnW5CtjZAaTLow8x924wMFYeF5M_QUGf8qYrSfEngd3tmBqtRpjdq9VYK6yTobTkReqUscXS4BRRvf5UPziQ-2bJig2AF7cAqeuA4YR0hoKjwIiRmFjfl0tztFn7dA2gema2YIJHuJmMuidMTkGzTkc_OQLlA95bopzxtjJkoNT_e7Hasij5_dldCYCun9x6e4_1izg_cVMJ9BsTDlVm4qorYTuLtTbf3PQR3HtsBGoFCs9XCc",
    cities: [
      {
        name: "Londen",
        studioCount: "450+",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALoyOmI2-Qvwq8nY4DhEUtHPwodfnW5CtjZAaTLow8x924wMFYeF5M_QUGf8qYrSfEngd3tmBqtRpjdq9VYK6yTobTkReqUscXS4BRRvf5UPziQ-2bJig2AF7cAqeuA4YR0hoKjwIiRmFjfl0tztFn7dA2gema2YIJHuJmMuidMTkGzTkc_OQLlA95bopzxtjJkoNT_e7Hasij5_dldCYCun9x6e4_1izg_cVMJ9BsTDlVm4qorYTuLtTbf3PQR3HtsBGoFCs9XCc",
        slug: "london",
      },
      {
        name: "Manchester",
        studioCount: "140+",
        image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800",
        slug: "manchester",
      },
      {
        name: "Bristol",
        studioCount: "85+",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
        slug: "bristol",
      },
      {
        name: "Edinburgh",
        studioCount: "65+",
        image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800",
        slug: "edinburgh",
      },
    ],
    topStudios: [
      {
        id: "mock-uk-1",
        title: "Shoreditch Creative Hub",
        location: "London, Shoreditch",
        pricePerHour: 95,
        rating: 4.9,
        reviewCount: 278,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        tags: ["Content", "Photography"],
      },
      {
        id: "mock-uk-2",
        title: "Northern Quarter Studio",
        location: "Manchester, NQ",
        pricePerHour: 55,
        rating: 4.8,
        reviewCount: 145,
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        tags: ["Music", "Podcast"],
      },
      {
        id: "mock-uk-3",
        title: "Harbourside Studios",
        location: "Bristol, Harbourside",
        pricePerHour: 45,
        rating: 4.7,
        reviewCount: 98,
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        tags: ["Film", "Video"],
      },
    ],
    trends: [
      {
        type: "large",
        title: "De Creatieve Explosie van Oost-Londen",
        description: "Hoe Shoreditch en Hackney de creatieve hoofdstad van Europa werden.",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
        tag: "TRENDING",
      },
      {
        type: "medium",
        title: "De Muziekstudio's van Manchester",
        description: "De stad die ons Oasis gaf blijft het geluid van morgen vormgeven.",
        icon: "music_note",
        stat: "30 nieuwe muziekstudio's",
      },
      {
        type: "small",
        title: "De Street Art Scene van Bristol",
        description: "De geboortestad van Banksy trekt visuele creators van over de hele wereld aan.",
      },
      {
        type: "highlight",
        title: "Monumentale Panden",
        image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600",
      },
    ],
  },
}

export async function generateMetadata({ params }: PageProps) {
  const { country } = await params
  const data = countryData[country]
  const t = await getTranslations("Explore")

  if (!data) {
    return { title: t("countryNotFound") }
  }

  return {
    title: `${t("studiosLabel")} in ${data.name} | lctnships`,
    description: data.heroDescription,
  }
}

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params
  const data = countryData[country]
  const t = await getTranslations("Explore")

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="relative w-full h-[300px] sm:h-[450px] md:h-[600px] rounded-2xl sm:rounded-[2rem] overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <Image
              src={data.heroImage}
              alt={data.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70" />
          </div>
          <div className="absolute bottom-0 left-0 p-4 sm:p-8 md:p-12 w-full max-w-2xl">
            <h1 className="text-white text-2xl sm:text-4xl md:text-6xl font-black mb-2 sm:mb-4 leading-[1.1] tracking-tight">
              {data.heroTitle}
            </h1>
            <p className="text-white/90 text-sm sm:text-lg md:text-xl mb-4 sm:mb-8 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {data.heroDescription}
            </p>
            <Link
              href={`/studios?country=${country}`}
              className="inline-flex items-center gap-2 bg-black text-white h-11 sm:h-14 px-6 sm:px-10 rounded-xl font-bold text-sm sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {t("viewStudios")}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Featured Cities Section */}
        <section className="mt-10 sm:mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-0 mb-4 sm:mb-8 px-2">
            <div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight">{t("featuredCities")}</h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">{t("creativeHubs")}</p>
            </div>
            <Link
              href="/explore"
              className="text-black font-bold flex items-center gap-1 hover:underline text-sm sm:text-base"
            >
              {t("viewAllCities")}
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 -mx-2 px-2 scrollbar-hide">
            {data.cities.map((city) => (
              <Link
                key={city.slug}
                href={`/studios?city=${city.slug}`}
                className="flex-none w-48 sm:w-72 group cursor-pointer"
              >
                <div className="h-64 sm:h-96 rounded-2xl sm:rounded-[2rem] overflow-hidden relative shadow-lg mb-3 sm:mb-4">
                  <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-500">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      sizes="288px"
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                    <h3 className="text-lg sm:text-2xl font-bold">{city.name}</h3>
                    <p className="text-xs sm:text-sm text-white/80">{city.studioCount} {t("studiosLabel")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Rated Studios Grid */}
        <section className="mt-12 sm:mt-24">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-4 sm:mb-8 px-2">
            {t("bestStudiosIn", { country: data.name })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {data.topStudios.map((studio) => (
              <Link
                key={studio.id}
                href={`/studios/${studio.id}`}
                className="bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className="h-48 sm:h-64 relative">
                  <Image
                    src={studio.image}
                    alt={studio.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                    {studio.rating} ({studio.reviewCount})
                  </div>
                </div>
                <div className="p-4 sm:p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base sm:text-xl font-bold group-hover:text-black transition-colors">
                      {studio.title}
                    </h3>
                    <span className="text-black font-bold text-sm sm:text-base">€{studio.pricePerHour}{t("perHour")}</span>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-6 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {studio.location}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-6">
                    {studio.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="w-full border-2 border-black text-black font-bold py-3 rounded-xl hover:bg-black hover:text-white transition-all">
                    {t("bookNow")}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Local Trends Section (Bento Box style) */}
        <section className="mt-12 sm:mt-24 mb-12 sm:mb-24">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-4 sm:mb-8 px-2">{t("localTrends")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 sm:gap-6 h-auto md:h-[600px]">
            {/* Large Card */}
            {data.trends.filter(tr => tr.type === "large").map((trend, i) => (
              <div
                key={i}
                className="md:col-span-2 md:row-span-2 relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl group min-h-[280px] sm:min-h-0"
              >
                {trend.image && (
                  <>
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <Image
                        src={trend.image}
                        alt={trend.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-10">
                      {trend.tag && (
                        <span className="bg-gray-200 backdrop-blur text-black px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 inline-block">
                          {trend.tag}
                        </span>
                      )}
                      <h3 className="text-white text-xl sm:text-3xl font-bold mb-2 sm:mb-3">{trend.title}</h3>
                      <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">{trend.description}</p>
                      <button className="text-white font-bold text-sm sm:text-base flex items-center gap-2 hover:translate-x-1 transition-transform">
                        {t("readArticle")}
                        <span className="material-symbols-outlined">east</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Medium Card */}
            {data.trends.filter(tr => tr.type === "medium").map((trend, i) => (
              <div
                key={i}
                className="md:col-span-2 relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl group bg-white p-5 sm:p-10 flex flex-col justify-center border border-gray-100"
              >
                <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">{trend.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">{trend.description}</p>
                <div className="flex items-center gap-4">
                  {trend.icon && (
                    <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined">{trend.icon}</span>
                    </div>
                  )}
                  {trend.stat && <span className="font-bold">{trend.stat}</span>}
                </div>
              </div>
            ))}

            {/* Small Card */}
            {data.trends.filter(tr => tr.type === "small").map((trend, i) => (
              <div
                key={i}
                className="md:col-span-1 relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl group bg-black p-5 sm:p-8 text-white"
              >
                <h3 className="text-base sm:text-xl font-bold mb-2">{trend.title}</h3>
                <p className="text-white/80 text-xs sm:text-sm">{trend.description}</p>
                <span className="material-symbols-outlined absolute bottom-6 right-6 text-4xl opacity-20">
                  bolt
                </span>
              </div>
            ))}

            {/* Highlight Card */}
            {data.trends.filter(tr => tr.type === "highlight").map((trend, i) => (
              <div
                key={i}
                className="md:col-span-1 relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl group min-h-[180px] sm:min-h-0"
              >
                {trend.image && (
                  <>
                    <Image
                      src={trend.image}
                      alt={trend.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                    <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-end">
                      <h3 className="text-white font-bold text-base sm:text-lg">{trend.title}</h3>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-12 sm:mb-24 px-2">
          <div className="bg-[#111d21] rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-64 bg-gray-200 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 size-64 bg-gray-100 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 relative z-10">
              {t("readyToStart")}
            </h2>
            <p className="text-white/60 text-sm sm:text-lg mb-6 sm:mb-10 max-w-xl mx-auto relative z-10">
              {t("joinCreators", { country: data.name })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/studios"
                className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white h-11 sm:h-14 px-6 sm:px-10 rounded-xl font-bold text-sm sm:text-lg transition-all shadow-lg"
              >
                {t("viewMarketplace")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
