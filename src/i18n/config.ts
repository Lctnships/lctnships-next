export const locales = ["nl", "en", "es"] as const
export const defaultLocale = "nl" as const

export type Locale = (typeof locales)[number]
