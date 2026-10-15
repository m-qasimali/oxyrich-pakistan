'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

/**
 * Label + control + hint + translated error. The control receives the ids it needs
 * for aria-describedby / aria-invalid via the render prop.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string
  optional?: boolean
  className?: string
  children: (aria: {
    id: string
    'aria-invalid': boolean | undefined
    'aria-describedby': string | undefined
  }) => React.ReactNode
}) {
  const t = useTranslations()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('grid gap-2', className)}>
      <label htmlFor={id} className="text-foreground text-sm leading-none font-medium">
        {label}
        {optional ? (
          <span className="text-muted-foreground ms-1 font-normal">({t('common.optional')})</span>
        ) : null}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint ? (
        <p id={hintId} className="text-muted-foreground text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-sm font-medium">
          {t.has(error) ? t(error) : error}
        </p>
      ) : null}
    </div>
  )
}

/** Off-screen honeypot field. Real users never see or fill it. */
export function Honeypot(props: React.ComponentProps<'input'>) {
  const t = useTranslations('form')
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
      <label>
        {t('honeypot')}
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  )
}
