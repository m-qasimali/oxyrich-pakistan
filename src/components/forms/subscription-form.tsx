'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { subscriptionSchema } from '@/lib/validation'
import { createSubscription } from '@/server/actions/account'
import { Field } from '@/components/ui/field'
import { Input, NativeSelect, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QtyStepper } from '@/components/products/add-to-order'
import { Link } from '@/i18n/navigation'
import { applyFieldErrors } from './form-utils'

type In = z.input<typeof subscriptionSchema>
type Out = z.output<typeof subscriptionSchema>

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function SubscriptionForm({
  products,
  defaults,
}: {
  products: { id: string; name: string }[]
  defaults: { sector: string; address: string }
}) {
  const t = useTranslations()
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [minDate] = React.useState(tomorrow)
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      productId: products[0]?.id ?? '',
      qty: 2,
      frequency: 'WEEKLY',
      startDate: minDate,
      sector: defaults.sector,
      address: defaults.address,
      notes: '',
    },
  })
  const { register, handleSubmit, formState, control, setError: setFieldError } = form
  const e = formState.errors

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const res = await createSubscription(values)
    if (!res.ok) {
      applyFieldErrors(setFieldError, res.fieldErrors)
      return setError(res.error)
    }
    setDone(true)
  })

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="text-success size-12" aria-hidden />
        <p className="text-lg font-semibold">{t('subscriptions.started')}</p>
        <Button asChild>
          <Link href="/account">{t('nav.account')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {products.length > 1 ? (
        <Field id="sub-product" label={t('order.product')} error={e.productId?.message}>
          {(aria) => (
            <NativeSelect {...aria} {...register('productId')}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="sub-frequency" label={t('subscriptions.frequency')} error={e.frequency?.message}>
          {(aria) => (
            <NativeSelect {...aria} {...register('frequency')}>
              <option value="WEEKLY">{t('subscriptions.weekly')}</option>
              <option value="BIWEEKLY">{t('subscriptions.biweekly')}</option>
            </NativeSelect>
          )}
        </Field>
        <Field id="sub-qty" label={t('subscriptions.bottles')} error={e.qty?.message}>
          {(aria) => (
            <Controller
              control={control}
              name="qty"
              render={({ field }) => (
                <QtyStepper
                  id={aria.id}
                  value={Number(field.value) || 1}
                  onChange={field.onChange}
                  max={50}
                  label={t('subscriptions.bottles')}
                  className="w-full justify-between"
                />
              )}
            />
          )}
        </Field>
      </div>
      <Field id="sub-start" label={t('subscriptions.startDate')} error={e.startDate?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="date"
            min={minDate}
            className="ltr-nums"
            {...register('startDate')}
          />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <Field id="sub-sector" label={t('order.sector')} error={e.sector?.message}>
          {(aria) => (
            <Input {...aria} placeholder={t('order.sectorPlaceholder')} {...register('sector')} />
          )}
        </Field>
        <Field id="sub-address" label={t('order.address')} error={e.address?.message}>
          {(aria) => (
            <Input {...aria} placeholder={t('order.addressPlaceholder')} {...register('address')} />
          )}
        </Field>
      </div>
      <Field id="sub-notes" label={t('order.notes')} optional error={e.notes?.message}>
        {(aria) => <Textarea {...aria} rows={2} {...register('notes')} />}
      </Field>
      {error ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-medium"
        >
          {t(error)}
        </p>
      ) : null}
      <Button type="submit" variant="cta" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {t('subscriptions.start')}
      </Button>
    </form>
  )
}
