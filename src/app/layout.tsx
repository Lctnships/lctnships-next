import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google"
import { SITE_URL, SITE_NAME } from "@/lib/seo"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "lctnships | Creative Studio Rental Platform",
    template: "%s | lctnships",
  },
  description: "The premium platform for creators to find and book unique studio spaces worldwide.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "lctnships | Creative Studio Rental Platform",
    description: "The premium platform for creators to find and book unique studio spaces worldwide.",
    images: [
      {
        url: "/Lctnships.png",
        width: 1200,
        height: 630,
        alt: "lctnships — Creative Studio Rental Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "lctnships | Creative Studio Rental Platform",
    description: "The premium platform for creators to find and book unique studio spaces worldwide.",
    images: ["/Lctnships.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon-logo-transparent.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols loaded synchronously with display=block.
            'block' (not 'swap') keeps icon glyphs hidden until the font is
            available — otherwise users see literal text like "add", "settings"
            during the swap window (the "flash of icon names" bug).
            CSS payload is ~1KB; perf impact is negligible. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300,0..1,0&display=block"
        />
      </head>
      <body className={`${plusJakarta.variable} ${newsreader.variable} font-sans antialiased selection:bg-sky-200/30`}>
        {children}
      </body>
    </html>
  )
}
