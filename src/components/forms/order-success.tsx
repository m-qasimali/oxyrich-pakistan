'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { TrackedLink } from '@/components/layout/tracked-link'
import { WhatsAppIcon } from '@/components/layout/whatsapp-icon'
import { whatsappLink } from '@/lib/utils'
import { formatPhone } from '@/lib/phone'

export function OrderSuccess({
  orderNumber,
  phone,
  whatsappText,
  showCreateAccount,
  onContinue,
}: {
  orderNumber: string
  phone: string
  whatsappText: string
  showCreateAccount?: boolean
  onContinue?: () => void
}) {
  const t = useTranslations('order')
  const s = useSiteSettings()
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  React.useEffect(() => headingRef.current?.focus(), [])

  const intro = t('whatsappSummary', { number: orderNumber })
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center" role="status">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        <CheckCircle2 className="size-9" aria-hidden />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold outline-none"
        data-testid="order-success"
      >
        {t('successTitle', { number: orderNumber })}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {t('successBody', { phone: formatPhone(phone) })}
      </p>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button asChild variant="whatsapp" size="lg">
          <TrackedLink
            event="whatsapp_click"
            params={{ location: 'order_success' }}
            href={whatsappLink(s.whatsappNumber, `${intro}\n${whatsappText}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="size-5" />
            {t('sendWhatsApp')}
          </TrackedLink>
        </Button>
        {onContinue ? (
          <Button variant="outline" size="lg" onClick={onContinue}>
            {t('continue')}
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg">
            <Link href="/products">{t('continue')}</Link>
          </Button>
        )}
      </div>
      {showCreateAccount ? (
        <Link
          href="/register"
          className="text-accent-strong text-sm font-semibold underline-offset-4 hover:underline"
        >
          {t('createAccount')}
        </Link>
      ) : null}
    </div>
  )
}
