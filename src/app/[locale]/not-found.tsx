import { Link } from "@/i18n/routing"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header with logo */}
      <header className="px-6 py-6">
        <Link href="/">
          <Image
            src="/Lctnships-cropped.png"
            alt="lcntships"
            width={140}
            height={62}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">
            Error 404
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight text-black mb-4">
            Page not found
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-8 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-black/90 transition-colors"
            >
              Back to home
            </Link>
            <Link
              href="/studios"
              className="px-8 py-3 border border-gray-200 text-sm font-bold rounded-full hover:bg-gray-50 transition-colors"
            >
              Browse studios
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="px-6 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold">
          &copy; {new Date().getFullYear()} lcntships
        </p>
      </footer>
    </div>
  )
}
