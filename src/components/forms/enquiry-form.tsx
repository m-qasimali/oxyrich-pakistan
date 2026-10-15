'use client'

import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { enquirySchema, enquiryTypes } from '@/lib/validation'
import { submitEnquiry } from '@/server/actions/enquiries'
import { Field, Honeypot } from '@/components/ui/field'
import { Input, NativeSelect, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'
import { Turnstile } from './turnstile'
import { applyFieldErrors } from './form-utils'

type In = z.input<typeof enquirySchema>
type Out = z.output<typeof enquirySchema>
export type EnquiryType = (typeof enquiryTypes)[number]

export function EnquiryForm({
  defaultType = 'CONTACT',
  idPrefix = 'enq',
}: {
  defaultType?: EnquiryType
  idPrefix?: string
}) {
  const t = useTranslations()
  const [sent, setSent] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      type: defaultType,
      name: '',
      phone: '',
      email: '',
      company: '',
      monthlyVolume: '',
      address: '',
      message: '',
      company_website: '',
      turnstileToken: '',
    },
  })
  const { register, handleSubmit, formState, setError, setValue, reset, control } = form
  const type = useWatch({ control, name: 'type' })

  // Let "Request bulk pricing"-style links preselect the enquiry type.
  React.useEffect(() => {
    setValue('type', defaultType)
  }, [defaultType, setValue])

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const res = await submitEnquiry(values)
    if (!res.ok) {
      applyFieldErrors(setError, res.fieldErrors)
      setFormError(res.error)
      return
    }
    track('enquiry_submitted', { type: values.type })
    setSent(true)
    reset({ ...values, message: '', company_website: '' })
  })

  const id = (n: string) => `${idPrefix}-${n}`
  const e = formState.errors

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-8 text-center"
        data-testid="enquiry-success"
      >
        <CheckCircle2 className="text-success size-12" aria-hidden />
        <p className="text-lg font-semibold">{t('form.sent')}</p>
        <Button variant="outline" onClick={() => setSent(false)}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <Field id={id('type')} label={t('form.enquiryType')} error={e.type?.message}>
        {(aria) => (
          <NativeSelect {...aria} {...register('type')}>
            {enquiryTypes.map((ty) => (
              <option key={ty} value={ty}>
                {t(`form.types.${ty}`)}
              </option>
            ))}
          </NativeSelect>
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id('name')} label={t('form.name')} error={e.name?.message}>
          {(aria) => <Input {...aria} autoComplete="name" {...register('name')} />}
        </Field>
        <Field id={id('phone')} label={t('form.phone')} error={e.phone?.message}>
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
      <Field id={id('email')} label={t('form.email')} optional error={e.email?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="email"
            autoComplete="email"
            className="ltr-nums text-start"
            {...register('email')}
          />
        )}
      </Field>
      {type === 'COMMERCIAL' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id('company')} label={t('form.company')} error={e.company?.message}>
            {(aria) => <Input {...aria} autoComplete="organization" {...register('company')} />}
          </Field>
          <Field
            id={id('volume')}
            label={t('form.monthlyVolume')}
            optional
            error={e.monthlyVolume?.message}
          >
            {(aria) => (
              <Input
                {...aria}
                placeholder={t('form.monthlyVolumePlaceholder')}
                {...register('monthlyVolume')}
              />
            )}
          </Field>
        </div>
      ) : null}
      {type !== 'CONTACT' ? (
        <Field id={id('address')} label={t('form.address')} optional error={e.address?.message}>
          {(aria) => <Input {...aria} autoComplete="street-address" {...register('address')} />}
        </Field>
      ) : null}
      <Field id={id('message')} label={t('form.message')} error={e.message?.message}>
        {(aria) => <Textarea {...aria} rows={5} {...register('message')} />}
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
      <Button type="submit" variant="default" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {formState.isSubmitting ? t('form.sending') : t('common.send')}
      </Button>
    </form>
  )
}
