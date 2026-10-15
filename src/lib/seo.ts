import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SITE_URL, type SiteSettings } from '@/config/site'
import type { ProductView } from './products'

type MetaKey =
  | 'home'
  | 'products'
  | 'order'
  | 'subscriptions'
  | 'services'
  | 'quality'
  | 'about'
  | 'contact'
  | 'faq'
  | 'login'
  | 'register'
  | 'forgot'
  | 'reset'
  | 'account'
  | 'privacy'
  | 'terms'

/** Locale-aware URL path: English has no prefix, Urdu lives under /ur. */
export function localePath(locale: string, path: string) {
  const clean = path === '/' ? '' : path
  return locale === 'en' ? clean || '/' : `/${locale}${clean}`
}

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path === '/' ? '' : path}` || SITE_URL
}

/** Title, description, canonical, hreflang alternates and Open Graph for a page. */
export async function pageMetadata(
  locale: string,
  path: string,
  key: MetaKey,
  overrides: { title?: string; description?: string; noindex?: boolean; images?: string[] } = {},
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = overrides.title ?? t(`${key}.title`)
  const description = overrides.description ?? t(`${key}.description`)
  const canonical = localePath(locale, path)
  return {
    // The home title is already fully branded; other pages use the layout template.
    title: key === 'home' ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        en: localePath('en', path),
        ur: localePath('ur', path),
        'x-default': localePath('en', path),
      },
    },
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      locale: locale === 'ur' ? 'ur_PK' : 'en_PK',
      url: canonical,
      title,
      description,
      ...(overrides.images ? { images: overrides.images } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
    ...(overrides.noindex ? { robots: { index: false, follow: false } } : {}),
  }
}

/* ───────────────────────────── JSON-LD ───────────────────────────── */

export function organizationJsonLd(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: s.businessName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-dark.png`,
    email: s.email,
    telephone: s.phoneE164,
    sameAs: Object.values(s.social).filter(Boolean),
  }
}

export function localBusinessJsonLd(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: s.businessName,
    description:
      'Purified, mineral- and oxygen-enriched bottled drinking water with free home and office delivery in Islamabad.',
    url: SITE_URL,
    image: `${SITE_URL}/images/products/19-litre.jpg`,
    logo: `${SITE_URL}/images/brand/logo-dark.png`,
    telephone: s.phoneE164,
    email: s.email,
    priceRange: 'Rs',
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${s.address.street}, ${s.address.sector}`,
      addressLocality: s.address.city,
      addressRegion: 'Islamabad Capital Territory',
      addressCountry: s.address.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng },
    areaServed: { '@type': 'City', name: 'Islamabad' },
    openingHoursSpecification: s.is24x7
      ? [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        ]
      : undefined,
  }
}

export function productJsonLd(p: ProductView, s: SiteSettings, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Oxyrich ${p.name}`,
    description: p.description,
    image: p.images.map((src) => absoluteUrl(src)),
    brand: { '@type': 'Brand', name: 'Oxyrich' },
    category: p.category,
    url,
    // Only expose a price once the client has confirmed real prices.
    ...(s.pricesConfirmed
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'PKR',
            price: p.price,
            availability: p.isAvailable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url,
            seller: { '@id': `${SITE_URL}/#organization` },
          },
        }
      : {}),
  }
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.name,
      item: absoluteUrl(i.path),
    })),
  }
}
