import { Link } from "@/i18n/routing"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) {
    redirect("/host/onboarding")
  }

  const supabase = await createClient()
  const { data: studio } = await supabase
    .from("studios")
    .select("*")
    .eq("id", id)
    .single()

  if (!studio) {
    redirect("/host/onboarding")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 px-10 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-black">
          <div className="size-6">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.1288 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight">lctnships</h2>
        </Link>
        <div className="flex items-center gap-9">
          <Link href="/host/dashboard" className="text-sm font-medium hover:text-black transition-colors">
            Dashboard
          </Link>
          <Link href="/host/studios" className="text-sm font-medium hover:text-black transition-colors">
            Advertenties
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-black/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[800px] w-full text-center flex flex-col items-center relative z-10">
          {/* Check Icon */}
          <div className="mb-10 w-28 h-28 rounded-full bg-black/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-black">task_alt</span>
          </div>

          {/* Heading */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
              Studio ingediend!
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              Bedankt! Je studio wordt beoordeeld door ons team. Je ontvangt een bericht zodra deze is goedgekeurd.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-200 rounded-full text-sm font-semibold text-amber-700">
              <span className="material-symbols-outlined text-base">hourglass_top</span>
              In afwachting van goedkeuring
            </div>
          </div>

          {/* Studio Preview Card */}
          <div className="w-full max-w-[400px] mb-16 group">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:scale-[1.02]">
              <div className="relative h-56 w-full rounded-[2rem] overflow-hidden mb-4 bg-gray-100">
                {studio.images?.[0] ? (
                  <Image
                    src={studio.images[0]}
                    alt={studio.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <span className="material-symbols-outlined text-6xl">image</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-yellow-500">star</span>
                  Nieuw
                </div>
              </div>
              <div className="px-2 text-left">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg">{studio.title}</h3>
                  <p className="text-black font-bold">
                    €{studio.price_per_hour}
                    <span className="text-xs text-gray-500 font-normal">/uur</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span>{studio.city || studio.location}</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    {studio.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/host/studios"
              className="px-10 py-5 rounded-full bg-gray-900 text-white font-bold text-lg shadow-xl hover:bg-black/90 transition-all hover:scale-[1.03] active:scale-95"
            >
              Mijn Studio&apos;s
            </Link>
            <Link
              href="/host/dashboard"
              className="px-10 py-5 rounded-full bg-white border border-gray-200 text-gray-900 font-bold text-lg hover:bg-gray-50 transition-all hover:scale-[1.03] active:scale-95"
            >
              Ga naar Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
