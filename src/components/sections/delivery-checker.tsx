'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, MapPin, MessageCircleQuestion } from 'lucide-react'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrackedLink } from '@/components/layout/tracked-link'
import { findDeliveryArea } from '@/lib/delivery-areas'
import { whatsappLink } from '@/lib/utils'

export function DeliveryChecker() {
  const t = useTranslations('delivery')
  const s = useSiteSettings()
  const [query, setQuery] = React.useState('')
  const [result, setResult] = React.useState<{ query: string; area: string | null } | null>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setResult({ query: query.trim(), area: findDeliveryArea(query, s.deliveryAreas) })
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="area-query" className="sr-only">
          {t('label')}
        </label>
        <div className="relative flex-1">
          <MapPin
            className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="area-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="h-12 ps-11"
            autoComplete="off"
            list="area-suggestions"
          />
          <datalist id="area-suggestions">
            {s.deliveryAreas
              .flatMap((g) => g.areas)
              .map((a) => (
                <option key={a} value={a} />
              ))}
          </datalist>
        </div>
        <Button type="submit" size="lg" className="h-12">
          {t('check')}
        </Button>
      </form>

      <div aria-live="polite" className="mt-4 min-h-6">
        {result ? (
          result.area ? (
            <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
              {t('yes', { area: result.area })}
            </p>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center dark:bg-amber-900/30 dark:text-amber-100">
              <p className="flex flex-1 items-start gap-2 font-medium">
                <MessageCircleQuestion className="mt-0.5 size-5 shrink-0" aria-hidden />
                {t('no', { area: result.query })}
              </p>
              <Button asChild variant="whatsapp" size="sm">
                <TrackedLink
                  event="whatsapp_click"
                  params={{ location: 'delivery_checker' }}
                  href={whatsappLink(
                    s.whatsappNumber,
                    t('whatsappMessage', { area: result.query }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('askWhatsApp')}
                </TrackedLink>
              </Button>
            </div>
          )
        ) : null}
      </div>

      <details className="group mt-4">
        <summary className="text-accent-strong cursor-pointer text-sm font-semibold hover:underline">
          {t('allAreas')}
        </summary>
        <div className="mt-3 grid gap-3">
          {s.deliveryAreas.map((g) => (
            <div key={g.group}>
              <ul className="flex flex-wrap gap-1.5">
                {g.areas.map((a) => (
                  <li
                    key={a}
                    className="ltr-nums bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-semibold"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
