import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowLeft, Clock, RotateCcw, Truck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/products/product-image'
import { ProductCard, ProductPrice } from '@/components/products/product-card'
import { AddToOrderButton } from '@/components/products/add-to-order'
import { JsonLd } from '@/components/json-ld'
import { CATALOG_PRODUCTS } from '@/content/catalog'
import { getProductBySlug, getProducts } from '@/lib/products'
import { getSiteSettings } from '@/lib/settings'
import { formatPKR } from '@/lib/pricing'
import { absoluteUrl, breadcrumbJsonLd, localePath, pageMetadata, productJsonLd } from '@/lib/seo'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CATALOG_PRODUCTS.map((p) => ({ locale, slug: p.slug })),
  )
}

export async function generateMetadata({ params }: PageProps<'/[locale]/products/[slug]'>) {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return pageMetadata(locale, `/products/${slug}`, 'products', {
    title: `${product.name} — Oxyrich Mineral Water`,
    description: product.summary,
    images: product.images.filter((i) => !i.endsWith('.svg')),
  })
}

export default async function ProductPage({ params }: PageProps<'/[locale]/products/[slug]'>) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const t = await getTranslations()
  const [settings, all] = await Promise.all([getSiteSettings(), getProducts()])
  const others = all.filter((p) => p.id !== product.id)
  const url = absoluteUrl(localePath(locale, `/products/${slug}`))

  const specs: [string, string][] = [
    [t('products.category'), product.category],
    [t('products.size'), t('products.litres', { size: product.sizeLitres })],
    [
      t('products.pack'),
      product.packSize > 1 ? t('common.cartonOf', { count: product.packSize }) : t('common.single'),
    ],
    [
      t('products.depositLabel'),
      product.isReturnable && product.depositAmount > 0
        ? formatPKR(product.depositAmount)
        : t('products.noDeposit'),
    ],
  ]

  return (
    <>
      <section className="bg-ripple -mt-16 pt-16 lg:-mt-20 lg:pt-20">
        <div className="container-page py-10 lg:py-16">
          <Link
            href="/products"
            className="text-accent-strong inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t('products.backToProducts')}
          </Link>
          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="to-secondary dark:from-card dark:to-muted relative aspect-square overflow-hidden rounded-3xl border bg-linear-to-b from-white">
              <ProductImage
                src={product.images[0] ?? '/images/products/19-litre.jpg'}
                alt={`Oxyrich ${product.name}`}
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="p-8"
              />
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.isReturnable ? (
                  <Badge variant="success">
                    <RotateCcw className="size-3" aria-hidden />
                    {t('common.returnable')}
                  </Badge>
                ) : null}
              </div>
              <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                {product.description}
              </p>
              <div className="bg-card mt-6 rounded-2xl border p-6">
                <h2 className="text-base font-semibold">{t('products.orderBoxTitle')}</h2>
                <div className="mt-3">
                  <ProductPrice
                    product={product}
                    pricesConfirmed={settings.pricesConfirmed}
                    size="lg"
                  />
                </div>
                <div className="mt-5">
                  {product.isAvailable ? (
                    <AddToOrderButton
                      productId={product.id}
                      productName={product.name}
                      withQty
                      size="lg"
                    />
                  ) : (
                    <Badge variant="warning">{t('common.unavailable')}</Badge>
                  )}
                </div>
                <ul className="text-muted-foreground mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <li className="flex items-center gap-1.5">
                    <Truck className="text-accent-strong size-4" aria-hidden />
                    {t('common.freeDelivery')}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="text-accent-strong size-4" aria-hidden />
                    {t('common.open247')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t('products.specs')}</h2>
            <dl className="bg-card mt-5 divide-y rounded-2xl border">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-3.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="ltr-nums text-end font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('products.compositionTitle')}</h2>
            <div className="bg-card mt-5 overflow-x-auto rounded-2xl border">
              <table className="w-full text-sm">
                <caption className="text-muted-foreground px-5 pt-4 text-start text-xs">
                  {t('products.compositionNote')}
                </caption>
                <thead>
                  <tr className="border-b text-start">
                    <th scope="col" className="px-5 py-3 text-start font-semibold">
                      {t('products.mineral')}
                    </th>
                    <th scope="col" className="px-5 py-3 text-end font-semibold">
                      {t('products.value')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {product.composition.map((row) => (
                    <tr key={row.name}>
                      <th scope="row" className="px-5 py-3 text-start font-normal" lang="en">
                        {row.name}
                      </th>
                      <td className="ltr-nums px-5 py-3 text-end font-semibold">
                        {row.value} {row.value !== '—' ? row.unit : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="section bg-muted/60">
          <div className="container-page">
            <h2 className="text-2xl font-bold">{t('products.related')}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} pricesConfirmed={settings.pricesConfirmed} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd data={productJsonLd(product, settings, url)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t('nav.home'), path: localePath(locale, '/') },
          { name: t('nav.products'), path: localePath(locale, '/products') },
          { name: product.name, path: localePath(locale, `/products/${slug}`) },
        ])}
      />
    </>
  )
}
