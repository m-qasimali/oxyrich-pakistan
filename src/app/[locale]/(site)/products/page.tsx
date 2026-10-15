import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/sections/section-heading'
import { ProductCard } from '@/components/products/product-card'
import { CtaBand } from '@/components/sections/cta-band'
import { JsonLd } from '@/components/json-ld'
import { getProducts } from '@/lib/products'
import { getSiteSettings } from '@/lib/settings'
import { absoluteUrl, localePath, pageMetadata, productJsonLd } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<'/[locale]/products'>) {
  const { locale } = await params
  return pageMetadata(locale, '/products', 'products')
}

export default async function ProductsPage({ params }: PageProps<'/[locale]/products'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('products')
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()])

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />
      <section className="section pt-4 sm:pt-6">
        <div className="container-page">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  pricesConfirmed={settings.pricesConfirmed}
                  headingLevel="h2"
                  priority={i === 0}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
      {products.map((p) => (
        <JsonLd
          key={p.id}
          data={productJsonLd(p, settings, absoluteUrl(localePath(locale, `/products/${p.slug}`)))}
        />
      ))}
    </>
  )
}
