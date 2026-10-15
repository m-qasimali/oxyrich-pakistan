'use client'

import * as React from 'react'

/**
 * Counts up to `value` the first time it scrolls into view. The server renders the
 * final number (correct for no-JS, crawlers and reduced-motion users).
 */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const render = (n: number) => (node.textContent = `${n.toLocaleString('en-US')}${suffix}`)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const duration = 1600
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          render(Math.round(value * (1 - Math.pow(1 - t, 4)))) // ease-out-quart
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, suffix])

  return (
    <span ref={ref} className="ltr-nums tabular-nums">
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
