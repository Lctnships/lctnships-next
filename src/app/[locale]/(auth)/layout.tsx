import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Studio photo (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/DSC01072.jpg"
          alt="Creative studio space"
          fill
          sizes="50vw"
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/icon-logo-transparent.png" alt="" width={36} height={36} className="h-9 w-9 invert opacity-90" />
            <Image src="/Lctnships-cropped.png" alt="lctnships" width={140} height={62} className="h-8 w-auto invert opacity-90" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Find your perfect creative space</h2>
          <p className="text-lg text-white/80">Join thousands of creators booking premium studios worldwide.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
