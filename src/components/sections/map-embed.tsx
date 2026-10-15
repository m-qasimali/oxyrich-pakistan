'use client'

import * as React from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Click-to-load Google Map. Keeps the heavy iframe (and Google cookies) off the
 * page until the visitor asks for it — good for performance and privacy.
 */
export function MapEmbed({
  query,
  title,
  loadLabel,
  directionsLabel,
}: {
  query: string
  title: string
  loadLabel: string
  directionsLabel: string
}) {
  const [loaded, setLoaded] = React.useState(false)
  const q = encodeURIComponent(query)
  return (
    <div className="bg-secondary relative aspect-[4/3] overflow-hidden rounded-3xl border sm:aspect-[16/10]">
      {loaded ? (
        <iframe
          title={title}
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="bg-ripple absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="ripple-rings bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-full shadow-lg">
            <MapPin className="size-8" aria-hidden />
          </span>
          <p className="ltr-nums max-w-xs font-semibold">{query}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => setLoaded(true)}>{loadLabel}</Button>
            <Button asChild variant="outline">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${q}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {directionsLabel}
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
