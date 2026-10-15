'use client'

import { useTranslations } from 'next-intl'
import { Phone, ShoppingBasket } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { whatsappLink } from '@/lib/utils'
import { WHATSAPP_ORDER_MESSAGE } from '@/config/site'
import { TrackedLink } from './tracked-link'
import { WhatsAppIcon } from './whatsapp-icon'

/**
 * Floating WhatsApp button (all breakpoints ≥ md) and a sticky
 * Order / Call / WhatsApp bar on phones.
 */
export function FloatingActions() {
  const t = useTranslations('nav')
  const s = useSiteSettings()
  const wa = whatsappLink(s.whatsappNumber, WHATSAPP_ORDER_MESSAGE)

  return (
    <>
      <TrackedLink
        event="whatsapp_click"
        params={{ location: 'fab' }}
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsappFab')}
        className="fixed end-5 bottom-6 z-40 hidden size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl shadow-emerald-900/25 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-emerald-400/50 md:flex"
      >
        <WhatsAppIcon className="size-7" />
      </TrackedLink>

      <nav
        aria-label={t('order')}
        className="border-border/80 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      >
        <ul className="grid grid-cols-3">
          <li>
            <Link
              href="/order"
              className="text-primary dark:text-accent-strong flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold"
            >
              <span className="bg-cta text-cta-foreground flex size-8 items-center justify-center rounded-full">
                <ShoppingBasket className="size-4" aria-hidden />
              </span>
              {t('order')}
            </Link>
          </li>
          <li>
            <TrackedLink
              event="call_click"
              params={{ location: 'mobile_bar' }}
              href={`tel:${s.phoneE164}`}
              className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold"
            >
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
                <Phone className="size-4" aria-hidden />
              </span>
              {t('call')}
            </TrackedLink>
          </li>
          <li>
            <TrackedLink
              event="whatsapp_click"
              params={{ location: 'mobile_bar' }}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#25d366] text-white">
                <WhatsAppIcon className="size-4" />
              </span>
              {t('whatsapp')}
            </TrackedLink>
          </li>
        </ul>
      </nav>
    </>
  )
}
