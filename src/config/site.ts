/**
 * Single source of truth for business details.
 *
 * These are the DEFAULTS. Any key can be overridden at runtime from /admin/settings,
 * which writes a row to the `SiteSetting` table (see src/lib/settings.ts).
 * Components must read settings via `getSiteSettings()` (server) or `useSiteSettings()`
 * (client) — never hard-code the phone number, email, or stats.
 */

/** TODO: client to confirm — old site showed both "10+ Years" and "20 Years Experience". */
export const YEARS_IN_BUSINESS = 10

export type SiteSettings = {
  businessName: string
  /** Display format, e.g. "0336-4448494" */
  phone: string
  /** E.164 without spaces, used for tel: links */
  phoneE164: string
  /** Digits only, international, no "+" — used for https://wa.me/<number> */
  whatsappNumber: string
  email: string
  address: {
    street: string
    sector: string
    city: string
    country: string
    countryCode: string
  }
  /** TODO: client to confirm exact map pin for the I-9/3 premises. */
  geo: { lat: number; lng: number }
  hoursLabel: string
  is24x7: boolean
  freeDelivery: boolean
  /** PKR. 0 = free delivery. */
  deliveryFee: number
  /** False until the client confirms real prices; shows an "indicative price" note. */
  pricesConfirmed: boolean
  stats: {
    happyClients: number
    vehicles: number
    employees: number
    yearsInBusiness: number
  }
  /** TODO: client to provide social media URLs. Empty strings are hidden. */
  social: { facebook: string; instagram: string; tiktok: string; youtube: string }
  /** TODO: client to confirm delivery coverage. */
  deliveryAreas: DeliveryAreaGroup[]
}

export type DeliveryAreaGroup = { group: string; areas: string[] }

const range = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}-${from + i}`)

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: 'Oxyrich Pakistan',
  phone: '0336-4448494',
  phoneE164: '+923364448494',
  whatsappNumber: '923364448494',
  email: 'oxyrichpakistan@gmail.com',
  address: {
    street: '264, Street 6',
    sector: 'I-9/3',
    city: 'Islamabad',
    country: 'Pakistan',
    countryCode: 'PK',
  },
  // Approximate centre of sector I-9/3 — TODO: client to confirm exact pin.
  geo: { lat: 33.6588, lng: 73.0566 },
  hoursLabel: 'Monday–Sunday, 24/7',
  is24x7: true,
  freeDelivery: true,
  deliveryFee: 0,
  pricesConfirmed: false,
  stats: {
    happyClients: 876,
    vehicles: 50,
    employees: 12,
    yearsInBusiness: YEARS_IN_BUSINESS,
  },
  social: { facebook: '', instagram: '', tiktok: '', youtube: '' },
  deliveryAreas: [
    { group: 'I sectors', areas: range('I', 8, 10) },
    { group: 'G sectors', areas: range('G', 6, 15) },
    { group: 'F sectors', areas: range('F', 6, 11) },
    { group: 'E sectors', areas: ['E-7', 'E-11'] },
    { group: 'H sectors', areas: range('H', 8, 13) },
    { group: 'Housing societies', areas: ['DHA', 'Bahria Town'] },
  ],
}

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export const WHATSAPP_ORDER_MESSAGE = "Hi Oxyrich, I'd like to order water."
