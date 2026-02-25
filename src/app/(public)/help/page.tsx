"use client"

import { useState } from "react"
import Link from "next/link"

const categories = [
  {
    icon: "credit_card",
    title: "Booking & Payments",
    description: "Manage your invoices, refunds, and payment methods securely.",
    href: "/help/booking-payments",
  },
  {
    icon: "person",
    title: "For Renters",
    description: "Everything you need to know about finding and renting the perfect studio.",
    href: "/help/renters",
  },
  {
    icon: "storefront",
    title: "Studio Informatie",
    description: "Alles over studio's, faciliteiten en wat je kunt verwachten.",
    href: "/help/studios",
  },
  {
    icon: "settings",
    title: "Account & Settings",
    description: "Update your profile, change passwords, and manage preferences.",
    href: "/help/account",
  },
  {
    icon: "folder_open",
    title: "Projects",
    description: "Organize your creative workflows and team collaborations.",
    href: "/help/projects",
  },
  {
    icon: "cancel",
    title: "Cancellations",
    description: "Understand refund policies and how to cancel or reschedule bookings.",
    href: "/help/cancellations",
  },
]

const faqs = [
  {
    question: "Hoe boek ik een studio?",
    answer:
      'Zoek een studio via "Find a Studio", kies een datum en tijd, en volg het boekingsproces. Na bevestiging ontvang je een bevestigingsmail.',
  },
  {
    question: "What is the standard cancellation policy?",
    answer:
      "Our standard cancellation policy allows full refunds up to 48 hours before the booking. Cancellations within 48 hours may be subject to a partial refund depending on the host's settings.",
  },
  {
    question: "Can I book multiple days for a project?",
    answer:
      "Yes! You can book studios for multiple consecutive days. Many hosts offer discounts for extended bookings. Use the date range picker when searching.",
  },
  {
    question: "Is equipment rental included in the price?",
    answer:
      "Equipment availability varies by studio. Some studios include basic equipment, while others offer premium gear as add-ons. Check each studio's listing for details.",
  },
  {
    question: "How do I update my profile billing info?",
    answer:
      'Go to your Profile settings, then navigate to the "Billing" section. You can update your payment methods, billing address, and download invoices.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-8">
          How can we help?
        </h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto px-4 py-3 relative">
          <label className="flex flex-col min-w-40 h-16 w-full group">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white border border-gray-200 shadow-xl shadow-primary/5 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <div className="text-primary flex items-center justify-center pl-6 pr-2">
                <span className="material-symbols-outlined text-3xl">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden focus:outline-none focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-400 px-4 text-lg font-normal leading-normal"
                placeholder="Search articles, guides, or help topics..."
              />
              <div className="flex items-center pr-4">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">
                  CMD + K
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold leading-tight tracking-tight px-4 pb-8 text-center md:text-left">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 group"
            >
              <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{category.icon}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold leading-tight">{category.title}</h3>
                <p className="text-gray-500 text-sm font-normal leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQs and Contact Section */}
      <div className="w-full max-w-6xl mx-auto px-8 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FAQ Accordion */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-bold mb-8">Popular Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group-hover:bg-primary/5 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span
                    className={`material-symbols-outlined text-primary transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-primary rounded-xl p-8 text-white sticky top-24 shadow-2xl shadow-primary/30 overflow-hidden relative">
            {/* Abstract background circles */}
            <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 size-40 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Can't find what you need?</h2>
              <p className="text-white/80 mb-8 text-sm">
                Our support team is here to help you find the perfect creative space.
              </p>

              <div className="space-y-4">
                <button className="w-full bg-white text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors group">
                  <span className="material-symbols-outlined">chat</span>
                  Start Live Chat
                </button>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="size-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-white/90">
                    Usually responds in 5 mins
                  </span>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">mail</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Email us at</p>
                      <a
                        className="text-sm font-bold hover:underline"
                        href="mailto:support@lcntships.com"
                      >
                        support@lcntships.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">call</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Call us</p>
                      <p className="text-sm font-bold">+31 (0) 20 123 4567</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
