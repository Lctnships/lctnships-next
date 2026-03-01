import { Link } from "@/i18n/routing"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Cities")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

const cities = [
  {
    name: "Amsterdam",
    studioCount: 42,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvF8nE2l55sI26ZzFEi89XkFauQZ-l387xLD-DPGjpWo4dVmeSOTdhi9UawfX00aJoOro9TBl-8jl2yJ0zsAPYBxS_Ds9GtQr_LnQh37wQ-64ro91iOf1s2W7rPEVGdmiqe5nKpaUKYX3SuXlWlRCL3ocG53Y0vltPya2F5DyA9m-UpFqq6Mfh-3Et7MVZrNNtE643KsIlyO-4oAddJG0SxvB-hV6EVNgrUWqJhcUh2EbSbCCxqTFKR9Wd7kn_M3hZgt_Tn4OVJPo",
    slug: "amsterdam",
  },
  {
    name: "Berlin",
    studioCount: 56,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6ds4i4IDFQHlLQq0rQACFwHwtzd5N7_dtWNonXQ7V-gOn8SiyLcno2OzzYku0m2DZRyRqUQYnwn09sWsAfxBzNbQ1GyuQIpMSCrkJuRsfi80UkvtuwdaUJnJZb5Zpw_kxv87wFZEsuFPHThGE0KFHgWWt1mrY9ChwOlnDwwgBBPoSw2LbU6uvYICQsXQazUpneJryAVKNxeSPuNSZ5qKLBXHhXw6XzfJWfNtjlPLEDjDibFoZ69pw0MAjZzgAk2DVzBhbMEwJf2k",
    slug: "berlin",
  },
  {
    name: "Paris",
    studioCount: 39,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqCDQVaCn0iMoXpwpUd52gHNynqn-KaKSnxIY-FeCNnxpQu3F5GPfSjUg2eeo4BW0pT8fJaQTq6qn4iLRmQvCr7sup8LGTiX2teDpa-wY9jM-RCCJPisDEf3hK7gb-jtDREAsjvVDVoABICwZQibzAInLWrwbUZyVTjlUrWsidOJQh_6rFuV0QyFNZLl3PG3CTU-KX6o6_Ye1MUwDiLqYnfFJORiBhF008kaVVp6rhHbdg0dazwRrsz2rkVnIQPiLOS2c2SVbAZA",
    slug: "paris",
  },
  {
    name: "Rotterdam",
    studioCount: 28,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGY6gAjdDNpT0CnME8OxZZTXDRkO17V_QnawT4dh6OS_13Kg4PMUujCZgLL_QJTJfwo1Cg50qRvsuNHWJCo6lbsHY5aE9R5Gw-Rh0eCnfy2F4G3jtm6_yxYDpHMMyWWQF00p4MHKMFLIzwy0Hr-aOoRFqih-MMtgcRa3vw57gLn__bEdJuq6V6c2oE5F4_KJbTGMidWLEH8zoyQXpybSEtpYCcd4Xx92-Ryx8BPdpBueyQcA00mIN061T6zWx-Ra3u8xYj7Qw2Ptw",
    slug: "rotterdam",
  },
  {
    name: "Utrecht",
    studioCount: 15,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXDgOULlRndhIzH2VeDXVK4_o-NM9knZlwGV9siKHlnmiA4EFToCQfgBbHbGSdl1O9vqbTfIo-T0AeyE90QTs3aEv1Ww46kpKWeRhn1o1k4XDwQpbqR013krpXXlfLe4IVQik2k2rTIFFQPD9DsU5nK8mIj_AIN2DlYkF4I1DHjvFSWAIuBEwPBIh8IxCCo7kgBRaXYyZkLTLaL3mOpY9EQZ3gz2ilRM5sFw5yjfBIdwMzvprHs_Me1941-yQ42VDUnDKwM4d2uD8",
    slug: "utrecht",
  },
  {
    name: "London",
    studioCount: 64,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALoyOmI2-Qvwq8nY4DhEUtHPwodfnW5CtjZAaTLow8x924wMFYeF5M_QUGf8qYrSfEngd3tmBqtRpjdq9VYK6yTobTkReqUscXS4BRRvf5UPziQ-2bJig2AF7cAqeuA4YR0hoKjwIiRmFjfl0tztFn7dA2gema2YIJHuJmMuidMTkGzTkc_OQLlA95bopzxtjJkoNT_e7Hasij5_dldCYCun9x6e4_1izg_cVMJ9BsTDlVm4qorYTuLtTbf3PQR3HtsBGoFCs9XCc",
    slug: "london",
  },
]

export default async function CitiesPage() {
  const t = await getTranslations("Cities")

  return (
    <div className="min-h-screen">
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-gray-900 dark:text-white tracking-tight text-5xl font-extrabold leading-[1.1] text-center mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium text-center max-w-2xl mx-auto">
            {t("heroDesc")}
          </p>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/studios?city=${city.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30">
                  {city.studioCount} {t("studiosLabel")}
                </span>
              </div>
              <div className="absolute bottom-8 left-8">
                <h3 className="text-white text-3xl font-extrabold tracking-tight">{city.name}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Suggest Section */}
        <section className="max-w-3xl mx-auto py-16 px-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            {t("suggestCity")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            {t("suggestCityDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative w-full max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                className="w-full pl-12 pr-6 py-4 rounded-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-black focus:ring-0 transition-all text-sm font-semibold"
                placeholder={t("enterCityName")}
                type="text"
              />
            </div>
            <button className="w-full sm:w-auto px-8 py-4 bg-black text-white font-extrabold rounded-full hover:shadow-xl hover:brightness-105 active:scale-95 transition-all">
              {t("submitRequest")}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
