'use client'

import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { Loader2, ShoppingBasket, Trash2 } from 'lucide-react'
import { orderSchema } from '@/lib/validation'
import { submitOrder } from '@/server/actions/orders'
import { useCart } from '@/components/providers/cart-provider'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { Field, Honeypot } from '@/components/ui/field'
import { Input, NativeSelect, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QtyStepper } from '@/components/products/add-to-order'
import { Link } from '@/i18n/navigation'
import { formatPKR, quoteOrder, type PricedProduct } from '@/lib/pricing'
import { track } from '@/lib/analytics'
import { Turnstile } from './turnstile'
import { OrderSuccess } from './order-success'
import { applyFieldErrors } from './form-utils'

type In = z.input<typeof orderSchema>
type Out = z.output<typeof orderSchema>

export type CheckoutProduct = PricedProduct & {
  slug: string
  packSize: number
  isAvailable: boolean
}
export type SavedAddress = {
  id: string
  label: string | null
  sector: string
  street: string
  house: string
  notes: string | null
  isDefault: boolean
}

const addressLine = (a: SavedAddress) => [a.house, a.street, a.notes].filter(Boolean).join(', ')

export function OrderForm({
  products,
  user,
  addresses,
  bottleBalance,
}: {
  products: CheckoutProduct[]
  user: { name: string; phone: string } | null
  addresses: SavedAddress[]
  bottleBalance: number
}) {
  const t = useTranslations()
  const settings = useSiteSettings()
  const cart = useCart()
  const [done, setDone] = React.useState<{
    orderNumber: string
    phone: string
    whatsappText: string
  } | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)

  const byId = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const lines = cart.items
    .map((i) => ({ product: byId.get(i.productId), qty: i.qty }))
    .filter((l): l is { product: CheckoutProduct; qty: number } => Boolean(l.product))
  const hasReturnable = lines.some((l) => l.product.isReturnable)
  const returnableQty = lines.filter((l) => l.product.isReturnable).reduce((n, l) => n + l.qty, 0)

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      sector: defaultAddress?.sector ?? '',
      address: defaultAddress ? addressLine(defaultAddress) : '',
      notes: '',
      items: [],
      bottlesReturned: Math.min(bottleBalance, returnableQty),
      company_website: '',
      turnstileToken: '',
    },
  })
  const { register, handleSubmit, formState, setError, setValue, control } = form
  const bottlesReturned = Number(useWatch({ control, name: 'bottlesReturned' })) || 0

  // Keep the form's items in sync with the cart for validation.
  React.useEffect(() => {
    setValue(
      'items',
      cart.items.filter((i) => byId.has(i.productId)),
    )
  }, [cart.items, byId, setValue])

  // Once the cart has loaded, prefill empties from the customer's bottle balance.
  const prefilled = React.useRef(false)
  React.useEffect(() => {
    if (!cart.ready || prefilled.current) return
    prefilled.current = true
    if (bottleBalance > 0) setValue('bottlesReturned', Math.min(bottleBalance, returnableQty))
  }, [cart.ready, bottleBalance, returnableQty, setValue])

  const quote = quoteOrder(lines, { bottlesReturned, deliveryFee: settings.deliveryFee })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const res = await submitOrder(values)
    if (!res.ok) {
      applyFieldErrors(setError, res.fieldErrors)
      setFormError(res.error)
      return
    }
    track('order_placed', { value: res.total, currency: 'PKR', items: values.items.length })
    cart.clear()
    setDone({ orderNumber: res.orderNumber, phone: values.phone, whatsappText: res.whatsappText })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  if (done) {
    return (
      <Card className="mx-auto max-w-2xl p-8">
        <OrderSuccess {...done} showCreateAccount={!user} />
      </Card>
    )
  }

  // Reserve space until the cart is read from storage, so the page doesn't jump (CLS).
  if (!cart.ready) {
    return (
      <div
        className="bg-muted/50 min-h-[1100px] animate-pulse rounded-2xl lg:min-h-[640px]"
        aria-busy="true"
      />
    )
  }

  if (lines.length === 0) {
    return (
      <Card className="mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center">
        <ShoppingBasket className="text-muted-foreground size-12" aria-hidden />
        <p className="text-lg font-semibold">{t('order.empty')}</p>
        <Button asChild variant="cta" size="lg">
          <Link href="/products">{t('order.browse')}</Link>
        </Button>
      </Card>
    )
  }

  const e = formState.errors
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start"
    >
      <div className="grid gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold">{t('order.items')}</h2>
          <ul className="mt-4 divide-y" aria-live="polite">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="hover:text-accent-strong font-semibold"
                  >
                    {product.name}
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    <span className="ltr-nums">{formatPKR(product.price)}</span>{' '}
                    {t('common.perUnit', {
                      unit: product.packSize > 1 ? t('common.carton') : t('common.bottle'),
                    })}
                  </p>
                </div>
                <QtyStepper
                  value={qty}
                  onChange={(v) => cart.setQty(product.id, v)}
                  label={`${t('common.quantity')}: ${product.name}`}
                />
                <p className="ltr-nums w-24 text-end font-semibold tabular-nums">
                  {formatPKR(product.price * qty)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => cart.remove(product.id)}
                  aria-label={`${t('common.remove')}: ${product.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
          {e.items?.message ? (
            <p role="alert" className="text-destructive text-sm font-medium">
              {t(e.items.message)}
            </p>
          ) : null}
        </Card>

        <Card className="grid gap-5 p-6">
          <h2 className="text-xl font-bold">{t('order.details')}</h2>
          {user ? (
            <p className="text-muted-foreground text-sm">
              {t('order.loggedInAs', { name: user.name })}
            </p>
          ) : null}
          {addresses.length > 0 ? (
            <Field id="saved-address" label={t('order.useSavedAddress')}>
              {(aria) => (
                <NativeSelect
                  {...aria}
                  defaultValue={defaultAddress?.id}
                  onChange={(ev) => {
                    const a = addresses.find((x) => x.id === ev.target.value)
                    if (a) {
                      setValue('sector', a.sector, { shouldValidate: true })
                      setValue('address', addressLine(a), { shouldValidate: true })
                    }
                  }}
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {(a.label ? `${a.label} — ` : '') + `${addressLine(a)}, ${a.sector}`}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </Field>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="name" label={t('order.name')} error={e.name?.message}>
              {(aria) => <Input {...aria} autoComplete="name" {...register('name')} />}
            </Field>
            <Field
              id="phone"
              label={t('order.phone')}
              hint={t('order.phoneHint')}
              error={e.phone?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t('auth.phonePlaceholder')}
                  className="ltr-nums text-start"
                  {...register('phone')}
                />
              )}
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <Field id="sector" label={t('order.sector')} error={e.sector?.message}>
              {(aria) => (
                <Input
                  {...aria}
                  placeholder={t('order.sectorPlaceholder')}
                  {...register('sector')}
                />
              )}
            </Field>
            <Field id="address" label={t('order.address')} error={e.address?.message}>
              {(aria) => (
                <Input
                  {...aria}
                  autoComplete="street-address"
                  placeholder={t('order.addressPlaceholder')}
                  {...register('address')}
                />
              )}
            </Field>
          </div>
          {hasReturnable ? (
            <Field
              id="bottlesReturned"
              label={t('order.bottlesReturned')}
              hint={
                <>
                  {t('order.bottlesReturnedHint')}
                  {user ? <> {t('order.bottleBalance', { count: bottleBalance })}</> : null}
                </>
              }
              error={e.bottlesReturned?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={returnableQty}
                  className="ltr-nums w-32"
                  {...register('bottlesReturned')}
                />
              )}
            </Field>
          ) : null}
          <Field id="notes" label={t('order.notes')} optional error={e.notes?.message}>
            {(aria) => (
              <Textarea
                {...aria}
                rows={3}
                placeholder={t('order.notesPlaceholder')}
                {...register('notes')}
              />
            )}
          </Field>
          <Honeypot {...register('company_website')} />
          <Turnstile onToken={(tok) => setValue('turnstileToken', tok)} />
        </Card>
      </div>

      <Card className="grid gap-4 p-6 lg:sticky lg:top-28">
        <h2 className="text-xl font-bold">{t('order.summary')}</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('common.subtotal')}</dt>
            <dd className="ltr-nums font-medium tabular-nums">{formatPKR(quote.subtotal)}</dd>
          </div>
          {hasReturnable ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('order.deposit')}</dt>
              <dd className="ltr-nums font-medium tabular-nums" data-testid="deposit-total">
                {formatPKR(quote.depositTotal)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('order.delivery')}</dt>
            <dd className="text-success font-medium">
              {quote.deliveryFee === 0 ? (
                t('order.free')
              ) : (
                <span className="ltr-nums">{formatPKR(quote.deliveryFee)}</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('order.payment')}</dt>
            <dd className="font-medium">{t('order.cod')}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-4 border-t pt-4 text-lg">
            <dt className="font-bold">{t('common.total')}</dt>
            <dd className="ltr-nums font-bold tabular-nums" data-testid="order-total">
              {formatPKR(quote.total)}
            </dd>
          </div>
        </dl>
        {settings.pricesConfirmed ? null : (
          <p className="text-muted-foreground text-xs">{t('common.indicativePrice')}</p>
        )}
        {formError ? (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-medium"
          >
            {t(formError)}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="cta"
          size="xl"
          disabled={formState.isSubmitting || !cart.ready}
        >
          {formState.isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {formState.isSubmitting ? t('order.placing') : t('order.place')}
        </Button>
      </Card>
    </form>
  )
}
