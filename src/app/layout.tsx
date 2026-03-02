import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google"
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
  title: {
    default: "lcntships | Creative Studio Rental Platform",
    template: "%s | lcntships",
  },
  description: "The premium platform for creators to find and book unique studio spaces worldwide.",
  keywords: ["studio rental", "creative space", "photography studio", "video studio", "podcast studio", "Netherlands"],
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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakarta.variable} ${newsreader.variable} font-sans antialiased selection:bg-sky-200/30`}>
        {children}
      </body>
    </html>
  )
}
