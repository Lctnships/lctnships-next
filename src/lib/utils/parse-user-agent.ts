/**
 * Parse a user-agent string into device name, type, browser, and OS.
 * Lightweight parser — no external dependencies.
 */

interface ParsedDevice {
  deviceName: string
  deviceType: "laptop" | "phone" | "desktop" | "tablet"
  browser: string
  os: string
}

export function parseUserAgent(ua: string): ParsedDevice {
  const os = detectOS(ua)
  const browser = detectBrowser(ua)
  const deviceType = detectDeviceType(ua)
  const deviceName = buildDeviceName(ua, os, deviceType)

  return { deviceName, deviceType, browser, os }
}

function detectOS(ua: string): string {
  if (/iPhone/.test(ua)) return "iOS"
  if (/iPad/.test(ua)) return "iPadOS"
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS"
  if (/Windows NT 10/.test(ua)) return "Windows 10"
  if (/Windows NT/.test(ua)) return "Windows"
  if (/Android/.test(ua)) return "Android"
  if (/Linux/.test(ua)) return "Linux"
  if (/CrOS/.test(ua)) return "ChromeOS"
  return "Unknown OS"
}

function detectBrowser(ua: string): string {
  // Order matters — check specific browsers before generic ones
  if (/Edg\//.test(ua)) return "Edge"
  if (/OPR\/|Opera/.test(ua)) return "Opera"
  if (/Brave/.test(ua)) return "Brave"
  if (/Vivaldi/.test(ua)) return "Vivaldi"
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet"
  if (/Firefox\//.test(ua)) return "Firefox"
  if (/CriOS/.test(ua)) return "Chrome (iOS)"
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome"
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari"
  return "Unknown Browser"
}

function detectDeviceType(ua: string): "laptop" | "phone" | "desktop" | "tablet" {
  if (/iPad|tablet/i.test(ua)) return "tablet"
  if (/iPhone|Android.*Mobile|Mobile.*Android/i.test(ua)) return "phone"
  if (/Macintosh|Mac OS X/.test(ua)) return "laptop"
  if (/Windows NT/.test(ua)) return "desktop"
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return "tablet"
  return "desktop"
}

function buildDeviceName(ua: string, os: string, deviceType: string): string {
  // Try to extract specific device names
  if (/iPhone/.test(ua)) return "iPhone"
  if (/iPad/.test(ua)) return "iPad"

  const samsungMatch = ua.match(/SM-([A-Z]\d{3,4})/)
  if (samsungMatch) return `Samsung Galaxy ${samsungMatch[1]}`

  const pixelMatch = ua.match(/Pixel (\d+)/)
  if (pixelMatch) return `Google Pixel ${pixelMatch[1]}`

  // Fall back to OS + type
  if (os === "macOS") return "Mac"
  if (os.startsWith("Windows")) return "Windows PC"
  if (os === "Linux") return "Linux PC"
  if (os === "ChromeOS") return "Chromebook"
  if (os === "Android" && deviceType === "tablet") return "Android Tablet"
  if (os === "Android") return "Android Phone"

  return "Unknown Device"
}
