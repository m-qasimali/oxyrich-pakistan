'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/error-state'
import { useSiteSettings } from '@/components/providers/settings-provider'

export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const t = useTranslations()
  const s = useSiteSettings()
  React.useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <ErrorState code="500" title={t('errors.serverTitle')} body={t('errors.serverBody')}>
      <Button variant="cta" size="lg" onClick={() => retry()}>
        {t('errors.tryAgain')}
      </Button>
      <Button asChild variant="outline" size="lg">
        <a href={`tel:${s.phoneE164}`}>
          <Phone aria-hidden />
          <span className="ltr-nums">{s.phone}</span>
        </a>
      </Button>
    </ErrorState>
  )
}
