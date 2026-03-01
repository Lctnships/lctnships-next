import Image from "next/image"
import { Link } from "@/i18n/routing"

const trustPillars = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Protection for Hosts",
    features: [
      {
        title: "Insurance coverage:",
        description: "Up to $1M in property damage protection for every booking.",
      },
      {
        title: "Verified guest IDs:",
        description: "Every renter undergoes a mandatory background and identity check.",
      },
      {
        title: "Damage protection:",
        description: "Automated security deposit handling and rapid claims resolution.",
      },
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Safety for Renters",
    features: [
      {
        title: "Secure Escrow:",
        description: "Payments are held securely and only released to the host after your session begins.",
      },
      {
        title: "Verified Studios:",
        description: "On-site inspections and photo verification for every premium listing.",
      },
      {
        title: "24/7 Support:",
        description: "Our dedicated safety team is available around the clock to help.",
      },
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Community Standards",
    features: [
      {
        title: "Professional Conduct:",
        description: "Strict guidelines ensuring a respectful professional environment.",
      },
      {
        title: "Inclusivity:",
        description: "Zero tolerance for discrimination or harassment in any form.",
      },
      {
        title: "Dispute Resolution:",
        description: "Fair, impartial mediation for any conflicts between users.",
      },
    ],
  },
]

const safetyFeatures = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
    title: "Biometric ID",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
    title: "End-to-end Encrypted",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Human Support",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: "Legal Protection",
  },
]

export default function SafetyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 min-h-[420px] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZp3aBzRsD7aPNlWUw4xq0lECzN1ApRCOGJA_cCAJcy_XqwfszYJVxHO9FV0pkNBTRci6l53tbm_xwOuf2jWCOqcS0dhGDw_kUAQsK0CPQTekDceULEfdWZIqj3fA4jH4bhoOtSIrUxKOaJN_kCdkWilkvAOJ4c6uzkTzi9uAlgXk79GZ_efL6sJ3AX9IkBB0lbAPy_BfKolOKdXIAomAD6VqDwVRh9ptvVjCRCcmZSKhyYt7ffjJwmA8ePaKNgM7CJgGRcqD5-LM"
            alt="Safety background"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            unoptimized
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6 py-12">
          <span className="text-black font-bold tracking-widest text-xs uppercase">
            Your Security is Our Priority
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mt-4 text-gray-900 dark:text-white">
            Safety & Trust at lcntships
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg font-medium leading-relaxed mt-4">
            Building a secure, transparent environment where studio hosts and creative renters can flourish with complete peace of mind.
          </p>
          <div className="mt-8">
            <button className="inline-flex items-center justify-center rounded-full h-12 px-6 bg-black text-white text-base font-bold transition-transform hover:scale-105">
              Transparency Report
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            Our Commitment to Security
          </h2>
          <p className="text-gray-500 mt-2">Professional safeguards for every creative journey.</p>
        </div>

        {/* Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {trustPillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col gap-6 p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-2xl text-black group-hover:bg-black group-hover:text-white transition-colors">
                {pillar.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {pillar.title}
                </h3>
                <ul className="space-y-4">
                  {pillar.features.map((feature) => (
                    <li key={feature.title} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-black flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        <strong className="text-gray-900 dark:text-white">{feature.title}</strong>{" "}
                        {feature.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Core Safety Features */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold leading-tight tracking-tight mb-8 text-gray-900 dark:text-white">
            Core Safety Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {safetyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-3"
              >
                <div className="text-black">{feature.icon}</div>
                <p className="text-gray-900 dark:text-white font-bold text-sm">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report CTA Bar */}
        <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-2">See something concerning?</h2>
            <p className="text-gray-400 font-medium">
              Our trust and safety team reviews reports 24/7. Help us keep the community safe for everyone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-white text-gray-900 text-base font-bold transition-all hover:bg-gray-200 gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Report an Issue
            </button>
            <Link
              href="/help"
              className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-full h-12 px-6 border border-gray-700 text-white text-base font-bold transition-all hover:bg-gray-800"
            >
              Safety Center FAQ
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
