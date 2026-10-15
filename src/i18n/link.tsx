'use client'

import * as React from 'react'
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

const { Link: NavLink } = createNavigation(routing)

/**
 * Locale-aware Link that prefetches on intent (hover, focus or touch) instead of as
 * soon as it scrolls into view. Viewport prefetching of every header/footer link
 * downloads and evaluates the client JS of all those pages on first load, which
 * costs mobile visitors seconds of main-thread time.
 */
export function Link({
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: React.ComponentProps<typeof NavLink>) {
  const [active, setActive] = React.useState(false)
  return (
    <NavLink
      {...props}
      prefetch={prefetch === false ? false : active ? (prefetch ?? null) : false}
      onMouseEnter={(e) => {
        setActive(true)
        onMouseEnter?.(e)
      }}
      onFocus={(e) => {
        setActive(true)
        onFocus?.(e)
      }}
      onTouchStart={(e) => {
        setActive(true)
        onTouchStart?.(e)
      }}
    />
  )
}
