import { getTranslations } from 'next-intl/server'
import { Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { TrackedLink } from '@/components/layout/tracked-link'
import { WhatsAppIcon } from '@/components/layout/whatsapp-icon'
import { getSiteSettings } from '@/lib/settings'
import { whatsappLink } from '@/lib/utils'
import { WHATSAPP_ORDER_MESSAGE } from '@/config/site'

export async function CtaBand({ title, body }: { title?: string; body?: string }) {
  const t = await getTranslations()
  const s = await getSiteSettings()
  return (
    <section className="section">
      <div className="container-page">
        <div className="bg-ripple-dark relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-2xl shadow-indigo-950/30 sm:px-12">
          <div
            className="pointer-events-none absolute -end-20 -top-20 size-72 rounded-full border-[28px] border-white/5"
            aria-hidden
          />
          <div
            className="border-accent/15 pointer-events-none absolute -start-16 -bottom-24 size-64 rounded-full border-[24px]"
            aria-hidden
          />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">
            {title ?? t('home.ctaTitle')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
            {body ?? t('home.ctaBody')}
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="cta" size="xl">
              <Link href="/order">{t('common.orderNow')}</Link>
            </Button>
            <Button asChild variant="onDark" size="xl">
              <TrackedLink
                event="call_click"
                params={{ location: 'cta_band' }}
                href={`tel:${s.phoneE164}`}
              >
                <Phone aria-hidden />
                <span className="ltr-nums">{s.phone}</span>
              </TrackedLink>
            </Button>
            <Button asChild variant="whatsapp" size="xl">
              <TrackedLink
                event="whatsapp_click"
                params={{ location: 'cta_band' }}
                href={whatsappLink(s.whatsappNumber, WHATSAPP_ORDER_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-5" />
                {t('nav.whatsapp')}
              </TrackedLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
