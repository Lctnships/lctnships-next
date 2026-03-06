export const locales = ["nl", "en", "es", "fr", "de"] as const
export const defaultLocale = "nl" as const

export type Locale = (typeof locales)[number]
