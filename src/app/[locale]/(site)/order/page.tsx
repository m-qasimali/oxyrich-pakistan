import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/sections/section-heading'
import { OrderForm } from '@/components/forms/order-form'
import { getProducts } from '@/lib/products'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBottleBalance } from '@/server/orders'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/order'>) {
  const { locale } = await params
  return pageMetadata(locale, '/order', 'order')
}

export default async function OrderPage({ params }: PageProps<'/[locale]/order'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('order')
  const [products, user] = await Promise.all([getProducts(), getCurrentUser()])

  const [addresses, bottleBalance] = user
    ? await Promise.all([
        db.address.findMany({
          where: { userId: user.id },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        }),
        getBottleBalance(user.id),
      ])
    : [[], 0]

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />
      <section className="section pt-2 sm:pt-4">
        <div className="container-page">
          <OrderForm
            products={products.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: p.price,
              depositAmount: p.depositAmount,
              isReturnable: p.isReturnable,
              packSize: p.packSize,
              isAvailable: p.isAvailable,
            }))}
            user={user ? { name: user.name ?? '', phone: user.phone } : null}
            addresses={addresses.map((a) => ({
              id: a.id,
              label: a.label,
              sector: a.sector,
              street: a.street,
              house: a.house,
              notes: a.notes,
              isDefault: a.isDefault,
            }))}
            bottleBalance={bottleBalance}
          />
        </div>
      </section>
    </>
  )
}
