'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, LogOut, Plus, RotateCcw, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/navigation'
import { reorder } from '@/server/actions/orders'
import { logout } from '@/server/actions/auth'
import {
  addAddress,
  changePassword,
  deleteAddress,
  setDefaultAddress,
  updateSubscription,
  type SubscriptionCommand,
} from '@/server/actions/account'
import { addressSchema, changePasswordSchema } from '@/lib/validation'
import { PasswordInput } from '@/components/forms/password-input'
import { track } from '@/lib/analytics'
import { applyFieldErrors } from '@/components/forms/form-utils'

export function ReorderButton({ orderId }: { orderId: string }) {
  const t = useTranslations()
  const [pending, start] = React.useTransition()
  return (
    <Button
      size="sm"
      variant="cta"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await reorder(orderId)
          if (res.ok) {
            track('order_placed', { value: res.total, currency: 'PKR', reorder: true })
            toast.success(t('account.reordered', { number: res.orderNumber }))
          } else {
            toast.error(t(res.error))
          }
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <RotateCcw aria-hidden />}
      {pending ? t('account.reordering') : t('account.reorder')}
    </Button>
  )
}

export function SubscriptionControls({ id, status }: { id: string; status: 'ACTIVE' | 'PAUSED' }) {
  const t = useTranslations('account')
  const [pending, start] = React.useTransition()
  const [confirming, setConfirming] = React.useState(false)
  const run = (cmd: SubscriptionCommand) =>
    start(async () => {
      const res = await updateSubscription(id, cmd)
      if (!res.ok) toast.error(res.error)
      setConfirming(false)
    })

  if (confirming) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="destructive" disabled={pending} onClick={() => run('cancel')}>
          {t('confirmCancel')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          {t('keepPlan')}
        </Button>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {status === 'ACTIVE' ? (
        <>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => run('skip')}>
            {t('skip')}
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run('pause')}>
            {t('pause')}
          </Button>
        </>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => run('resume')}>
          {t('resume')}
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(true)}>
        {t('cancelPlan')}
      </Button>
    </div>
  )
}

export function AddressActions({ id, isDefault }: { id: string; isDefault: boolean }) {
  const t = useTranslations('account')
  const [pending, start] = React.useTransition()
  return (
    <div className="flex gap-1">
      {!isDefault ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => start(async () => void (await setDefaultAddress(id)))}
        >
          <Star aria-hidden />
          {t('makeDefault')}
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => start(async () => void (await deleteAddress(id)))}
        aria-label={t('delete')}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  )
}

export function AddAddressForm() {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const form = useForm<z.input<typeof addressSchema>, unknown, z.output<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', sector: '', street: '', house: '', notes: '' },
  })
  const { register, handleSubmit, formState, reset, setError } = form
  const e = formState.errors

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        {t('account.addAddress')}
      </Button>
    )
  }
  return (
    <form
      noValidate
      className="grid gap-4 rounded-2xl border p-5"
      onSubmit={handleSubmit(async (values) => {
        const res = await addAddress(values)
        if (!res.ok) return applyFieldErrors(setError, res.fieldErrors)
        reset()
        setOpen(false)
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="addr-label" label={t('account.label')} optional error={e.label?.message}>
          {(aria) => (
            <Input {...aria} placeholder={t('account.labelPlaceholder')} {...register('label')} />
          )}
        </Field>
        <Field id="addr-sector" label={t('order.sector')} error={e.sector?.message}>
          {(aria) => (
            <Input {...aria} placeholder={t('order.sectorPlaceholder')} {...register('sector')} />
          )}
        </Field>
        <Field id="addr-street" label={t('account.street')} error={e.street?.message}>
          {(aria) => <Input {...aria} {...register('street')} />}
        </Field>
        <Field id="addr-house" label={t('account.house')} error={e.house?.message}>
          {(aria) => <Input {...aria} {...register('house')} />}
        </Field>
      </div>
      <Field id="addr-notes" label={t('order.notes')} optional error={e.notes?.message}>
        {(aria) => <Input {...aria} {...register('notes')} />}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {t('common.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}

export function LogoutButton() {
  const t = useTranslations('account')
  const router = useRouter()
  const [pending, start] = React.useTransition()
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await logout()
          router.replace('/')
          router.refresh()
        })
      }
    >
      <LogOut aria-hidden className="rtl:-scale-x-100" />
      {t('logout')}
    </Button>
  )
}

export function ChangePasswordForm() {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const form = useForm<
    z.input<typeof changePasswordSchema>,
    unknown,
    z.output<typeof changePasswordSchema>
  >({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  })
  const { register, handleSubmit, formState, reset, setError } = form
  const e = formState.errors

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        {t('account.changePassword')}
      </Button>
    )
  }
  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        const res = await changePassword(values)
        if (!res.ok) {
          applyFieldErrors(setError, res.fieldErrors)
          if (!res.fieldErrors) toast.error(t(res.error))
          return
        }
        toast.success(t('account.passwordChanged'))
        reset()
        setOpen(false)
      })}
    >
      <Field
        id="cp-current"
        label={t('account.currentPassword')}
        error={e.currentPassword?.message}
      >
        {(aria) => (
          <PasswordInput
            {...aria}
            autoComplete="current-password"
            {...register('currentPassword')}
          />
        )}
      </Field>
      <Field id="cp-new" label={t('auth.newPassword')} error={e.password?.message}>
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" {...register('password')} />
        )}
      </Field>
      <Field id="cp-confirm" label={t('auth.confirmPassword')} error={e.confirmPassword?.message}>
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" {...register('confirmPassword')} />
        )}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {t('common.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
