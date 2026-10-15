'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Check, Minus, Plus, ShoppingBasket } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Link, useRouter } from '@/i18n/navigation'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 200,
  label,
  className,
  id,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
  className?: string
  id?: string
}) {
  const t = useTranslations('common')
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'border-input bg-background inline-flex h-11 items-center rounded-xl border',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t('decrease')}
        className="hover:bg-muted flex h-full w-11 items-center justify-center rounded-s-xl disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10)
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)))
        }}
        className="ltr-nums h-full w-12 [appearance:textfield] bg-transparent text-center font-semibold tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t('increase')}
        className="hover:bg-muted flex h-full w-11 items-center justify-center rounded-e-xl disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}

export function AddToOrderButton({
  productId,
  productName,
  disabled,
  withQty = false,
  className,
  size = 'default',
}: {
  productId: string
  productName: string
  disabled?: boolean
  withQty?: boolean
  className?: string
  size?: 'default' | 'lg'
}) {
  const t = useTranslations()
  const { add } = useCart()
  const router = useRouter()
  const [qty, setQty] = React.useState(1)
  const [justAdded, setJustAdded] = React.useState(false)

  const onAdd = () => {
    add(productId, qty)
    track('add_to_order', { product: productName, qty })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
    toast.success(`${qty} × ${productName}`, {
      description: t('common.added'),
      action: { label: t('products.goToOrder'), onClick: () => router.push('/order') },
    })
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {withQty ? <QtyStepper value={qty} onChange={setQty} label={t('common.quantity')} /> : null}
      <Button
        type="button"
        variant="cta"
        size={size}
        onClick={onAdd}
        disabled={disabled}
        className="flex-1"
      >
        {justAdded ? <Check aria-hidden /> : <ShoppingBasket aria-hidden />}
        {justAdded ? t('common.added') : t('common.addToOrder')}
      </Button>
      {withQty ? (
        <Button asChild variant="outline" size={size}>
          <Link href="/order">{t('products.goToOrder')}</Link>
        </Button>
      ) : null}
    </div>
  )
}
