import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Fade/slide a block in as it scrolls into view — pure CSS (scroll-driven
 * animations, see `.reveal` in globals.css), so it ships no JavaScript and never
 * delays hydration. Browsers without support, and prefers-reduced-motion users,
 * simply see the content.
 */
export function Reveal({
  children,
  className,
  as: Comp = 'div',
}: {
  children: React.ReactNode
  /** Kept for API compatibility; scroll-driven reveals are staggered by position. */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section'
}) {
  return <Comp className={cn('reveal', className)}>{children}</Comp>
}

export { CountUp } from './count-up'
