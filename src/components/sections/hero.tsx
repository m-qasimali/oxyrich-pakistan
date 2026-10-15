import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, BadgeCheck, Clock, FlaskConical, Truck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { TrackedLink } from '@/components/layout/tracked-link'
import { WhatsAppIcon } from '@/components/layout/whatsapp-icon'
import { getSiteSettings } from '@/lib/settings'
import { whatsappLink } from '@/lib/utils'
import { WHATSAPP_ORDER_MESSAGE } from '@/config/site'
import bottle from '../../../public/images/products/19-litre.jpg'

export async function Hero() {
  const t = await getTranslations()
  const s = await getSiteSettings()
  const badges = [
    { icon: Truck, label: t('common.freeDelivery') },
    { icon: Clock, label: t('common.open247') },
    { icon: BadgeCheck, label: t('common.filtration12') },
    { icon: FlaskConical, label: t('common.labTested') },
  ]

  return (
    <section
      className="bg-ripple relative -mt-16 overflow-hidden pt-16 lg:-mt-20 lg:pt-20"
      aria-labelledby="hero-title"
    >
      <div className="container-page grid items-center gap-10 pt-8 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:pt-12 lg:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <h1
            id="hero-title"
            className="text-primary mt-3 text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl dark:text-white"
          >
            {t('hero.title')}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed sm:text-xl">
            {t('hero.body')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="xl">
              <Link href="/order">
                {t('common.orderNow')}
                <ArrowRight className="rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="whatsapp" size="xl">
              <TrackedLink
                event="whatsapp_click"
                params={{ location: 'hero' }}
                href={whatsappLink(s.whatsappNumber, WHATSAPP_ORDER_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-5" />
                {t('common.orderOnWhatsApp')}
              </TrackedLink>
            </Button>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-x-6">
            {badges.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="text-foreground/85 flex items-center gap-2 text-sm font-semibold"
              >
                <span className="text-accent-strong flex size-8 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-white/10">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
          <div className="ripple-rings absolute inset-0" aria-hidden />
          <div className="relative mx-auto aspect-square w-[88%] overflow-hidden rounded-full border-8 border-white/70 shadow-2xl shadow-sky-900/20 dark:border-white/10">
            <Image
              src={bottle}
              alt={t('hero.imageAlt')}
              priority
              fetchPriority="high"
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 88vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
