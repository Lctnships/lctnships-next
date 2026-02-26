const features = [
  {
    icon: "verified",
    title: "Verified Studios",
    description: "Every space is personally vetted by our team to ensure it meets professional standards.",
  },
  {
    icon: "bolt",
    title: "Instant Booking",
    description: "Seamless scheduling and secure payments so you can focus on your creative vision.",
  },
  {
    icon: "camera",
    title: "Professional Gear",
    description: "Access high-end lighting, backdrops, and technical equipment in every location.",
  },
]

export function WhyLcntships() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-16 md:mt-32 py-12 md:py-20 bg-[#f8f9fa] rounded-[24px] md:rounded-[32px]">
      <h2 className="text-center text-2xl md:text-3xl font-extrabold tracking-tight mb-8 md:mb-16">Built for Creators</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 px-2 md:px-10">
        {features.map((feature) => (
          <div key={feature.title} className="text-center flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl text-primary">{feature.icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
