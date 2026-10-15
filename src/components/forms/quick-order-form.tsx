'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { Loader2, Send } from 'lucide-react'
import type { quickOrderSchema } from '@/lib/validation'
import { submitQuickOrder } from '@/server/actions/orders'
import { Field, Honeypot } from '@/components/ui/field'
import { Input, NativeSelect } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QtyStepper } from '@/components/products/add-to-order'
import { formatPKR } from '@/lib/pricing'
import { track } from '@/lib/analytics'
import { Turnstile } from './turnstile'
import { OrderSuccess } from './order-success'
import { applyFieldErrors } from './form-utils'

type In = z.input<typeof quickOrderSchema>
type Out = z.output<typeof quickOrderSchema>

/** Zod + resolver load on first validation, keeping ~50 KB of JS off the home page's critical path. */
const lazyResolver: Resolver<In, unknown, Out> = async (values, context, options) => {
  const [{ zodResolver }, { quickOrderSchema: schema }] = await Promise.all([
    import('@hookform/resolvers/zod'),
    import('@/lib/validation'),
  ])
  return zodResolver(schema)(values, context, options)
}

export type QuickOrderProduct = { id: string; name: string; price: number; packSize: number }

export function QuickOrderForm({ products }: { products: QuickOrderProduct[] }) {
  const t = useTranslations()
  const [done, setDone] = React.useState<{
    orderNumber: string
    phone: string
    whatsappText: string
  } | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<In, unknown, Out>({
    resolver: lazyResolver,
    defaultValues: {
      productId: products[0]?.id ?? '',
      qty: 1,
      sector: '',
      phone: '',
      name: '',
      company_website: '',
      turnstileToken: '',
    },
  })
  const { register, handleSubmit, control, formState, setError, setValue, reset } = form

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const res = await submitQuickOrder(values)
    if (!res.ok) {
      applyFieldErrors(setError, res.fieldErrors)
      setFormError(res.error)
      return
    }
    track('quick_order_placed', { value: res.total, currency: 'PKR' })
    setDone({ orderNumber: res.orderNumber, phone: values.phone, whatsappText: res.whatsappText })
  })

  if (done) {
    return (
      <OrderSuccess
        {...done}
        showCreateAccount
        onContinue={() => {
          setDone(null)
          reset()
        }}
      />
    )
  }

  const e = formState.errors
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative grid gap-5"
      aria-label={t('home.quickOrderTitle')}
    >
      <Field id="qo-product" label={t('order.product')} error={e.productId?.message}>
        {(aria) => (
          <NativeSelect {...aria} {...register('productId')}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatPKR(p.price)}
                {p.packSize > 1 ? ` / ${t('common.cartonOf', { count: p.packSize })}` : ''}
              </option>
            ))}
          </NativeSelect>
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="qo-qty" label={t('common.quantity')} error={e.qty?.message}>
          {(aria) => (
            <Controller
              control={control}
              name="qty"
              render={({ field }) => (
                <QtyStepper
                  id={aria.id}
                  value={Number(field.value) || 1}
                  onChange={field.onChange}
                  label={t('common.quantity')}
                  className="w-full justify-between"
                />
              )}
            />
          )}
        </Field>
        <Field id="qo-sector" label={t('order.sector')} error={e.sector?.message}>
          {(aria) => (
            <Input
              {...aria}
              placeholder={t('order.sectorPlaceholder')}
              autoComplete="address-level3"
              {...register('sector')}
            />
          )}
        </Field>
      </div>
      <Field
        id="qo-phone"
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
      <Honeypot {...register('company_website')} />
      <Turnstile onToken={(tok) => setValue('turnstileToken', tok)} />
      {formError ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-medium"
        >
          {t(formError)}
        </p>
      ) : null}
      <Button type="submit" variant="cta" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <Send aria-hidden className="rtl:-scale-x-100" />
        )}
        {formState.isSubmitting ? t('order.placing') : t('order.place')}
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        {t('order.cod')} · {t('common.freeDelivery')}
      </p>
    </form>
  )
}
