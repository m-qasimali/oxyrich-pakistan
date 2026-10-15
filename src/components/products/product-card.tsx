import { getTranslations } from 'next-intl/server'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { formatPKR } from '@/lib/pricing'
import type { ProductView } from '@/lib/products'
import { AddToOrderButton } from './add-to-order'
import { ProductImage } from './product-image'

export async function ProductPrice({
  product,
  pricesConfirmed,
  size = 'md',
}: {
  product: ProductView
  pricesConfirmed: boolean
  size?: 'md' | 'lg'
}) {
  const t = await getTranslations('common')
  const unit = product.packSize > 1 ? t('carton') : t('bottle')
  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className={size === 'lg' ? 'text-3xl font-bold' : 'text-2xl font-bold'}>
          <span className="ltr-nums">{formatPKR(product.price)}</span>
          {pricesConfirmed ? null : (
            <span className="text-accent-strong" aria-hidden>
              *
            </span>
          )}
        </span>
        <span className="text-muted-foreground text-sm">{t('perUnit', { unit })}</span>
      </p>
      {product.isReturnable && product.depositAmount > 0 ? (
        <p className="text-muted-foreground mt-1 text-sm">
          {t('deposit', { amount: formatPKR(product.depositAmount) })}
        </p>
      ) : null}
      {pricesConfirmed ? null : (
        <p className="text-muted-foreground mt-1 text-xs">* {t('indicativePrice')}</p>
      )}
    </div>
  )
}

export async function ProductCard({
  product,
  pricesConfirmed,
  headingLevel = 'h3',
  priority = false,
}: {
  product: ProductView
  pricesConfirmed: boolean
  headingLevel?: 'h2' | 'h3'
  /** Set for the first card when it is above the fold (LCP image). */
  priority?: boolean
}) {
  const t = await getTranslations()
  const H = headingLevel
  return (
    <article className="group bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm shadow-sky-950/5 transition-shadow hover:shadow-xl hover:shadow-sky-900/10">
      <div className="from-secondary to-background relative aspect-[4/3] overflow-hidden bg-linear-to-b">
        <ProductImage
          src={product.images[0] ?? '/images/products/19-litre.jpg'}
          alt={`Oxyrich ${product.name}`}
          priority={priority}
          className="p-6 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="ltr-nums">
            {t('products.litres', { size: product.sizeLitres })}
          </Badge>
          {product.packSize > 1 ? (
            <Badge variant="info">{t('common.cartonOf', { count: product.packSize })}</Badge>
          ) : null}
          {product.isReturnable ? (
            <Badge variant="success">
              <RotateCcw className="size-3" aria-hidden />
              {t('common.returnable')}
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {product.category}
          </p>
          <H className="mt-1 text-xl font-bold">
            <Link
              href={`/products/${product.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </H>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{product.summary}</p>
        </div>
        <div className="mt-auto">
          <ProductPrice product={product} pricesConfirmed={pricesConfirmed} />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {product.isAvailable ? (
            <AddToOrderButton
              productId={product.id}
              productName={product.name}
              className="flex-1"
            />
          ) : (
            <Badge variant="warning">{t('common.unavailable')}</Badge>
          )}
          <Link
            href={`/products/${product.slug}`}
            aria-label={`${t('common.learnMore')}: ${product.name}`}
            className="border-input hover:bg-muted inline-flex size-11 items-center justify-center rounded-xl border"
          >
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
