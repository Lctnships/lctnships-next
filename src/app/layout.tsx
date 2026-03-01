import type { Metadata, Viewport } from "next"
import "./globals.css"

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
  return children
}
