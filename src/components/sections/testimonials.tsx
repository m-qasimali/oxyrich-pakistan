'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { AnimatePresence, LazyMotion, m, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { cn, initials } from '@/lib/utils'

export type TestimonialItem = { id: string; name: string; text: string; rating: number }

const loadFeatures = () => import('./motion-features').then((r) => r.default)

const AVATAR_COLORS = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-ocean text-white',
  'bg-cta text-cta-foreground',
]

function TestimonialCard({ item, index }: { item: TestimonialItem; index: number }) {
  const t = useTranslations('common')
  return (
    <figure className="bg-card flex h-full flex-col rounded-2xl border p-7 shadow-sm">
      <Quote className="text-accent/50 size-8" aria-hidden />
      <div
        className="mt-3 flex gap-0.5"
        role="img"
        aria-label={t('rating', { rating: item.rating })}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn('size-4', i < item.rating ? 'fill-cta text-cta' : 'text-border')}
            aria-hidden
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-lg leading-relaxed">
        <p lang="en">“{item.text}”</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            'flex size-11 items-center justify-center rounded-full text-sm font-bold',
            AVATAR_COLORS[index % AVATAR_COLORS.length],
          )}
        >
          {initials(item.name)}
        </span>
        <span className="font-semibold">{item.name}</span>
      </figcaption>
    </figure>
  )
}

/** Accessible carousel: manual controls only (no auto-advance), one card on phones, two on desktop. */
export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const t = useTranslations('testimonials')
  const reduce = useReducedMotion()
  const [index, setIndex] = React.useState(0)
  const count = items.length
  if (count === 0) return null

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count)
  const visible = [items[index]!, ...(count > 1 ? [items[(index + 1) % count]!] : [])]

  return (
    <div aria-roledescription="carousel" className="mx-auto max-w-5xl">
      <div className="grid gap-5 lg:grid-cols-2" aria-live="polite">
        <LazyMotion features={loadFeatures} strict>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((item, i) => (
              <m.div
                key={`${item.id}-${i}`}
                aria-roledescription="slide"
                className={cn(i === 1 && 'hidden lg:block')}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <TestimonialCard item={item} index={(index + i) % count} />
              </m.div>
            ))}
          </AnimatePresence>
        </LazyMotion>
      </div>
      {count > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('prev')}
            className="bg-card hover:bg-muted flex size-11 items-center justify-center rounded-full border"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
          </button>
          <div className="flex gap-1">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t('goTo', { index: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
                className="flex size-6 items-center justify-center"
              >
                <span
                  className={cn(
                    'block h-2 rounded-full transition-all',
                    i === index ? 'bg-primary dark:bg-accent w-6' : 'bg-border w-2',
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('next')}
            className="bg-card hover:bg-muted flex size-11 items-center justify-center rounded-full border"
          >
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}
