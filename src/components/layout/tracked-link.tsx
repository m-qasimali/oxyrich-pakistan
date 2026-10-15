'use client'

import * as React from 'react'
import { track, type ConversionEvent } from '@/lib/analytics'

/** External/tel/WhatsApp anchor that records a conversion event on click. */
export function TrackedLink({
  event,
  params,
  onClick,
  ...props
}: React.ComponentProps<'a'> & {
  event: ConversionEvent
  params?: Record<string, string | number | boolean>
}) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, params)
        onClick?.(e)
      }}
    />
  )
}
