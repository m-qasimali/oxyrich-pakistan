import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CalendarCheck, CalendarRange, CheckCircle2 } from 'lucide-react'
import { PageHero } from '@/components/sections/section-heading'
import { SubscriptionForm } from '@/components/forms/subscription-form'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getProducts } from '@/lib/products'
import { getCurrentUser } from '@/lib/auth'
import { getSiteSettings } from '@/lib/settings'
import { db } from '@/lib/db'
import { formatPKR } from '@/lib/pricing'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/subscriptions'>) {
  const { locale } = await params
  return pageMetadata(locale, '/subscriptions', 'subscriptions')
}

export default async function SubscriptionsPage({ params }: PageProps<'/[locale]/subscriptions'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const [products, user, settings] = await Promise.all([
    getProducts(),
    getCurrentUser(),
    getSiteSettings(),
  ])
  const returnable = products.filter((p) => p.isReturnable && p.isAvailable)
  const main = returnable[0]

  const address = user
    ? await db.address.findFirst({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      })
    : null

  const plans = [
    { icon: CalendarCheck, title: t('subscriptions.weekly'), body: t('subscriptions.weeklyBody') },
    {
      icon: CalendarRange,
      title: t('subscriptions.biweekly'),
      body: t('subscriptions.biweeklyBody'),
    },
  ]

  return (
    <>
      <PageHero
        eyebrow={t('subscriptions.eyebrow')}
        title={t('subscriptions.title')}
        body={t('subscriptions.body')}
      />
      <section className="section pt-2 sm:pt-4">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid content-start gap-6">
            {plans.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card flex gap-4 rounded-2xl border p-6">
                <Icon className="text-accent-strong size-9 shrink-0" aria-hidden />
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-muted-foreground mt-1">{body}</p>
                  {main ? (
                    <p className="mt-2 text-sm font-semibold">
                      {main.name}: <span className="ltr-nums">{formatPKR(main.price)}</span>
                      {settings.pricesConfirmed ? '' : '*'} / {t('common.bottle')}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <ul className="bg-secondary/60 grid gap-3 rounded-2xl p-6">
              {[t('subscriptions.how1'), t('subscriptions.how2'), t('subscriptions.how3')].map(
                (s) => (
                  <li key={s} className="flex items-start gap-2">
                    <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" aria-hidden />
                    {s}
                  </li>
                ),
              )}
            </ul>
            {settings.pricesConfirmed ? null : (
              <p className="text-muted-foreground text-xs">* {t('common.indicativePrice')}</p>
            )}
          </div>

          <div className="bg-card rounded-3xl border p-6 sm:p-8">
            <h2 className="text-2xl font-bold">{t('subscriptions.formTitle')}</h2>
            <div className="mt-6">
              {returnable.length === 0 ? (
                <p className="text-muted-foreground">{t('subscriptions.noReturnable')}</p>
              ) : user ? (
                <SubscriptionForm
                  products={returnable.map((p) => ({ id: p.id, name: p.name }))}
                  defaults={{
                    sector: address?.sector ?? '',
                    address: address ? [address.house, address.street].join(', ') : '',
                  }}
                />
              ) : (
                <div className="grid gap-4">
                  <p className="text-muted-foreground">{t('subscriptions.loginRequired')}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href="/login?next=/subscriptions">{t('nav.login')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/register">{t('auth.signUp')}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
