import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { CalendarClock, KeyRound, MapPin, Package, Droplets } from 'lucide-react'
import { redirect, Link } from '@/i18n/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBottleBalance } from '@/server/orders'
import { formatOrderNumber, formatPKR } from '@/lib/pricing'
import { pageMetadata } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import {
  AddAddressForm,
  ChangePasswordForm,
  AddressActions,
  LogoutButton,
  ReorderButton,
  SubscriptionControls,
} from '@/components/account/account-controls'

export async function generateMetadata({ params }: PageProps<'/[locale]/account'>) {
  const { locale } = await params
  return pageMetadata(locale, '/account', 'account', { noindex: true })
}

export default async function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await getCurrentUser()
  if (!user) return redirect({ href: '/login?next=/account', locale })

  const t = await getTranslations()
  const format = await getFormatter()
  const [orders, subscriptions, addresses, bottles] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { items: true },
    }),
    db.subscription.findMany({
      where: { userId: user.id, status: { not: 'CANCELLED' } },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    }),
    getBottleBalance(user.id),
  ])

  return (
    <section className="bg-ripple -mt-16 pt-16 lg:-mt-20 lg:pt-20">
      <div className="container-page py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t('account.title')}</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl" data-testid="account-greeting">
              {t('account.hello', { name: user.name ?? '' })}
            </h1>
            <p className="ltr-nums text-muted-foreground mt-1">{user.phone}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="grid gap-6 lg:col-span-2">
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Package className="text-accent-strong size-5" aria-hidden />
                {t('account.orders')}
              </h2>
              {orders.length === 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <p className="text-muted-foreground">{t('account.noOrders')}</p>
                  <Button asChild variant="cta">
                    <Link href="/products">{t('order.browse')}</Link>
                  </Button>
                </div>
              ) : (
                <ul className="mt-4 divide-y" data-testid="order-history">
                  {orders.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          <span className="ltr-nums">{formatOrderNumber(o.number)}</span>
                          <StatusBadge status={o.status} label={t(`status.${o.status}`)} />
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {format.dateTime(o.createdAt, { dateStyle: 'medium' })} ·{' '}
                          {o.items.map((i) => `${i.qty} × ${i.productName}`).join(', ')}
                        </p>
                      </div>
                      <p className="ltr-nums font-semibold tabular-nums">{formatPKR(o.total)}</p>
                      <ReorderButton orderId={o.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card rounded-2xl border p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <MapPin className="text-accent-strong size-5" aria-hidden />
                {t('account.addresses')}
              </h2>
              {addresses.length === 0 ? (
                <p className="text-muted-foreground mt-4">{t('account.noAddresses')}</p>
              ) : (
                <ul className="mt-4 divide-y">
                  {addresses.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-semibold">
                          {a.label || a.sector}{' '}
                          {a.isDefault ? (
                            <Badge variant="secondary">{t('account.default')}</Badge>
                          ) : null}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {[a.house, a.street, a.sector, a.notes].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <AddressActions id={a.id} isDefault={a.isDefault} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <AddAddressForm />
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="bg-ripple-dark rounded-2xl p-6 text-white">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Droplets className="text-cta size-5" aria-hidden />
                {t('account.bottles')}
              </h2>
              <p className="font-display mt-3 text-5xl font-extrabold" data-testid="bottle-balance">
                <span className="ltr-nums">{bottles}</span>
              </p>
              <p className="mt-1 text-sm text-white/80">{t('account.bottlesBody')}</p>
            </div>

            <div className="bg-card rounded-2xl border p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <CalendarClock className="text-accent-strong size-5" aria-hidden />
                {t('account.subscription')}
              </h2>
              {subscriptions.length === 0 ? (
                <div className="mt-3 grid gap-3">
                  <p className="text-muted-foreground">{t('account.noSubscription')}</p>
                  <Button asChild variant="outline">
                    <Link href="/subscriptions">{t('account.startPlan')}</Link>
                  </Button>
                </div>
              ) : (
                <ul className="mt-3 grid gap-4">
                  {subscriptions.map((s) => (
                    <li key={s.id} className="bg-muted/60 grid gap-2 rounded-xl p-4">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {s.qty} × {s.product.name}
                        <StatusBadge
                          status={s.status as 'ACTIVE' | 'PAUSED'}
                          label={t(`status.${s.status}`)}
                        />
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {t(`status.${s.frequency}`)} ·{' '}
                        {t('account.nextDelivery', {
                          date: format.dateTime(s.nextDeliveryDate, {
                            dateStyle: 'medium',
                            timeZone: 'UTC',
                          }),
                        })}
                      </p>
                      <SubscriptionControls id={s.id} status={s.status as 'ACTIVE' | 'PAUSED'} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card rounded-2xl border p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <KeyRound className="text-accent-strong size-5" aria-hidden />
                {t('account.security')}
              </h2>
              <div className="mt-3">
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
