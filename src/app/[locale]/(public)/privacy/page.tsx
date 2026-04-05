import { Link } from "@/i18n/routing"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - lctnships",
  description: "Privacy Policy van lctnships - hoe wij omgaan met uw persoonlijke gegevens",
}

const sections = [
  { id: "introduction", icon: "info", title: "Introduction" },
  { id: "collection", icon: "database", title: "Information Collection" },
  { id: "usage", icon: "insights", title: "Usage of Data" },
  { id: "gdpr", icon: "verified_user", title: "GDPR & User Rights" },
  { id: "cookies", icon: "cookie", title: "Cookies & Tracking" },
  { id: "contact", icon: "mail", title: "Contact Information" },
]

export default function PrivacyPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-gray-900">Privacy Policy</span>
      </nav>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sticky Sidebar */}
        <aside className="hidden lg:block lg:w-72 flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Table of Contents</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Jump to section</p>
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
            <hr className="border-gray-100" />
            <button className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black font-medium transition-colors py-2">
              <span className="material-symbols-outlined text-lg">print</span>
              Print Document
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl flex flex-col gap-6 sm:gap-10">
          {/* Page Heading */}
          <div className="flex flex-col gap-3 sm:gap-4 border-b border-gray-100 pb-6 sm:pb-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">Privacy Policy</h1>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-500 text-lg">calendar_today</span>
              <p className="text-gray-500 font-medium">Last Updated: January 24, 2025</p>
            </div>
          </div>

          {/* Section 1: Introduction */}
          <section className="scroll-mt-24" id="introduction">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">1. Introduction</h2>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
              At lctnships, we value your privacy and are committed to protecting your personal data. This policy outlines how we handle information when you use our creative studio rental platform. Whether you are a studio owner listing your space or a creative professional looking for your next workspace, we ensure your data is treated with the highest standard of care.
            </p>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 mb-4">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-black mt-1">lightbulb</span>
                <p className="text-sm font-medium leading-relaxed">
                  <strong>Summary:</strong> We only collect data necessary to provide you with the best studio booking experience. We never sell your personal information to third parties.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Information Collection */}
          <section className="scroll-mt-24" id="collection">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">2. Information Collection</h2>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-3 sm:mb-4">
              We collect several types of information from and about users of our Services, including:
            </p>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-4">
                <div className="mt-2 size-2 rounded-full bg-black flex-shrink-0"></div>
                <div>
                  <span className="font-bold">Identity Data:</span> includes first name, last name, username or similar identifier, and title.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-2 size-2 rounded-full bg-black flex-shrink-0"></div>
                <div>
                  <span className="font-bold">Contact Data:</span> includes email address and telephone numbers.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-2 size-2 rounded-full bg-black flex-shrink-0"></div>
                <div>
                  <span className="font-bold">Transaction Data:</span> includes details about payments to and from you and other details of products and services you have purchased from us.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 3: Usage of Data */}
          <section className="scroll-mt-24" id="usage">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">3. Usage of Data</h2>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
              We use your data to provide, maintain, and improve our services. Specifically, this includes processing your studio bookings, managing your account, and communicating updates regarding your reservations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="font-bold text-sm mb-1">Operational Use</p>
                <p className="text-sm text-gray-500">Verifying identity and facilitating secure payments for studio rentals.</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="font-bold text-sm mb-1">Customer Support</p>
                <p className="text-sm text-gray-500">Responding to inquiries and resolving technical issues or booking disputes.</p>
              </div>
            </div>
          </section>

          {/* Section 4: GDPR & User Rights */}
          <section className="scroll-mt-24" id="gdpr">
            <div className="flex items-center gap-3 mb-3 sm:mb-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold">4. GDPR & User Rights</h2>
              <span className="bg-gray-100 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">EU Compliance</span>
            </div>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
              Under the General Data Protection Regulation (GDPR), users in the European Economic Area have specific rights regarding their personal data:
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white">
                <span className="material-symbols-outlined text-black">visibility</span>
                <div>
                  <p className="font-bold">Right of Access</p>
                  <p className="text-sm text-gray-500">You can request copies of your personal data at any time through your dashboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white">
                <span className="material-symbols-outlined text-black">delete_sweep</span>
                <div>
                  <p className="font-bold">Right to Erasure</p>
                  <p className="text-sm text-gray-500">You have the right to request that we delete your personal data under certain conditions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white">
                <span className="material-symbols-outlined text-black">edit_square</span>
                <div>
                  <p className="font-bold">Right to Rectification</p>
                  <p className="text-sm text-gray-500">You have the right to request that we correct any information you believe is inaccurate.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Cookies & Tracking */}
          <section className="scroll-mt-24" id="cookies">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">5. Cookies & Tracking</h2>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-3 sm:mb-4">
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          {/* Section 6: Contact Information */}
          <section className="scroll-mt-24 mb-10 sm:mb-20" id="contact">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">6. Contact Information</h2>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
              If you have any questions about this Privacy Policy, please contact our data protection officer:
            </p>
            <div className="bg-gray-900 text-white p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Legal Department</h3>
                <p className="text-gray-400 text-sm mb-4">Available Mon-Fri, 9am - 5pm CET</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-black">mail</span>
                    <span className="font-medium">privacy@lctnships.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-black">location_on</span>
                    <span className="font-medium">Amsterdam, Netherlands</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <Link href="/contact">
                  <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105">
                    Send Inquiry
                  </button>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Back to Top */}
      <a
        href="#"
        className="fixed bottom-8 right-8 size-12 bg-white shadow-xl rounded-full flex items-center justify-center text-black border border-gray-100 hover:-translate-y-1 transition-all"
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </a>
    </main>
  )
}
