"use client"

import Image from "next/image"

export function SailboatLoader({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeMap = {
    sm: { boat: 40, container: "h-16" },
    md: { boat: 64, container: "h-24" },
    lg: { boat: 96, container: "h-36" },
  }

  const { boat, container } = sizeMap[size]

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${container} relative flex items-end justify-center`}>
        {/* Sailboat */}
        <div className="animate-sailboat relative z-10">
          <Image
            src="/icon logo.png"
            alt="Loading..."
            width={boat}
            height={boat}
            className="drop-shadow-sm"
            priority
          />
        </div>
      </div>

      {/* Waves */}
      <div className="relative w-32 h-3 -mt-6">
        <div className="animate-wave absolute inset-0">
          <svg viewBox="0 0 120 12" fill="none" className="w-full h-full">
            <path
              d="M0 6 Q10 2 20 6 Q30 10 40 6 Q50 2 60 6 Q70 10 80 6 Q90 2 100 6 Q110 10 120 6"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {text && (
        <p className="text-sm text-gray-400 font-medium animate-pulse mt-2">{text}</p>
      )}
    </div>
  )
}
