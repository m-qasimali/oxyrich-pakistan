import type { MetadataRoute } from 'next'
import { CATALOG_PRODUCTS } from '@/content/catalog'
import { absoluteUrl, localePath } from '@/lib/seo'

const PAGES: {
  path: string
  priority: number
  changeFrequency: 'weekly' | 'monthly' | 'yearly'
}[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/order', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/subscriptions', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/quality', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  ...CATALOG_PRODUCTS.map((p) => ({
    path: `/products/${p.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  })),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(localePath('en', path)),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: absoluteUrl(localePath('en', path)),
        ur: absoluteUrl(localePath('ur', path)),
      },
    },
  }))
}
