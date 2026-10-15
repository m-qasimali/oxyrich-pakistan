'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/validation'
import {
  login,
  register as registerAction,
  requestPasswordReset,
  resetPassword,
} from '@/server/actions/auth'
import { Field, Honeypot } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link, useRouter } from '@/i18n/navigation'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { TrackedLink } from '@/components/layout/tracked-link'
import { whatsappLink } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { PasswordInput } from './password-input'
import { Turnstile } from './turnstile'
import { applyFieldErrors } from './form-utils'

function FormError({ error }: { error: string | null }) {
  const t = useTranslations()
  if (!error) return null
  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-medium"
    >
      {t.has(error) ? t(error) : error}
    </p>
  )
}

function SubmitButton({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <Button type="submit" variant="default" size="lg" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {pending ? busy : idle}
    </Button>
  )
}

/** Only allow same-site relative redirects after login. */
function safeNext(next?: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'
}

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const form = useForm<z.input<typeof loginSchema>, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '', remember: true },
  })
  const { register, handleSubmit, formState } = form

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const res = await login(values)
    if (!res.ok) return setError(res.error)
    router.replace(safeNext(next))
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field id="login-phone" label={t('phone')} error={formState.errors.phone?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            className="ltr-nums text-start"
            {...register('phone')}
          />
        )}
      </Field>
      <Field id="login-password" label={t('password')} error={formState.errors.password?.message}>
        {(aria) => (
          <PasswordInput {...aria} autoComplete="current-password" {...register('password')} />
        )}
      </Field>
      <div className="flex items-center justify-between gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-primary size-4 rounded"
            {...register('remember')}
          />
          {t('remember')}
        </label>
        <Link
          href="/forgot-password"
          className="text-accent-strong text-sm font-semibold hover:underline"
        >
          {t('forgotLink')}
        </Link>
      </div>
      <FormError error={error} />
      <SubmitButton pending={formState.isSubmitting} idle={t('login')} busy={t('loggingIn')} />
      <p className="text-muted-foreground text-center text-sm">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-accent-strong font-semibold hover:underline">
          {t('signUp')}
        </Link>
      </p>
    </form>
  )
}

export function RegisterForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const form = useForm<z.input<typeof registerSchema>, unknown, z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      company_website: '',
      turnstileToken: '',
    },
  })
  const { register, handleSubmit, formState, setError: setFieldError, setValue } = form
  const e = formState.errors

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const res = await registerAction(values)
    if (!res.ok) {
      applyFieldErrors(setFieldError, res.fieldErrors)
      return setError(res.error)
    }
    track('sign_up')
    router.replace('/account')
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <Field id="reg-name" label={t('name')} error={e.name?.message}>
        {(aria) => <Input {...aria} autoComplete="name" {...register('name')} />}
      </Field>
      <Field id="reg-phone" label={t('phone')} error={e.phone?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            className="ltr-nums text-start"
            {...register('phone')}
          />
        )}
      </Field>
      <Field
        id="reg-email"
        label={t('email')}
        optional
        hint={t('emailHint')}
        error={e.email?.message}
      >
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
      <Field id="reg-password" label={t('password')} error={e.password?.message}>
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" {...register('password')} />
        )}
      </Field>
      <Field id="reg-confirm" label={t('confirmPassword')} error={e.confirmPassword?.message}>
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" {...register('confirmPassword')} />
        )}
      </Field>
      <Honeypot {...register('company_website')} />
      <Turnstile onToken={(tok) => setValue('turnstileToken', tok)} />
      <FormError error={error} />
      <SubmitButton pending={formState.isSubmitting} idle={t('register')} busy={t('registering')} />
      <p className="text-muted-foreground text-center text-sm">
        {t('haveAccount')}{' '}
        <Link href="/login" className="text-accent-strong font-semibold hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </form>
  )
}

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const s = useSiteSettings()
  const [sentFor, setSentFor] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const form = useForm<
    z.input<typeof forgotPasswordSchema>,
    unknown,
    z.output<typeof forgotPasswordSchema>
  >({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone: '', company_website: '', turnstileToken: '' },
  })
  const { register, handleSubmit, formState, setValue } = form

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const res = await requestPasswordReset(values)
    if (!res.ok) return setError(res.error)
    setSentFor(values.phone)
  })

  if (sentFor) {
    return (
      <div role="status" className="grid gap-4 text-center">
        <CheckCircle2 className="text-success mx-auto size-12" aria-hidden />
        <p>{t('resetSent')}</p>
        <Button asChild variant="whatsapp" size="lg">
          <TrackedLink
            event="whatsapp_click"
            params={{ location: 'forgot_password' }}
            href={whatsappLink(s.whatsappNumber, t('resetWhatsAppMessage', { phone: sentFor }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('resetWhatsApp')}
          </TrackedLink>
        </Button>
        <Link href="/login" className="text-accent-strong text-sm font-semibold hover:underline">
          {t('signIn')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <Field id="forgot-phone" label={t('phone')} error={formState.errors.phone?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            className="ltr-nums text-start"
            {...register('phone')}
          />
        )}
      </Field>
      <Honeypot {...register('company_website')} />
      <Turnstile onToken={(tok) => setValue('turnstileToken', tok)} />
      <FormError error={error} />
      <SubmitButton pending={formState.isSubmitting} idle={t('sendReset')} busy={t('sending')} />
      <Link
        href="/login"
        className="text-accent-strong text-center text-sm font-semibold hover:underline"
      >
        {t('signIn')}
      </Link>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('auth')
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const form = useForm<
    z.input<typeof resetPasswordSchema>,
    unknown,
    z.output<typeof resetPasswordSchema>
  >({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirmPassword: '' },
  })
  const { register, handleSubmit, formState } = form

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const res = await resetPassword(values)
    if (!res.ok) return setError(res.error)
    setDone(true)
  })

  if (done) {
    return (
      <div role="status" className="grid gap-4 text-center">
        <CheckCircle2 className="text-success mx-auto size-12" aria-hidden />
        <p>{t('resetDone')}</p>
        <Button asChild size="lg">
          <Link href="/login">{t('login')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field
        id="reset-password"
        label={t('newPassword')}
        error={formState.errors.password?.message}
      >
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" {...register('password')} />
        )}
      </Field>
      <Field
        id="reset-confirm"
        label={t('confirmPassword')}
        error={formState.errors.confirmPassword?.message}
      >
        {(aria) => (
          <PasswordInput {...aria} autoComplete="new-password" {...register('confirmPassword')} />
        )}
      </Field>
      <FormError error={error ?? (formState.errors.token ? 'auth.resetInvalid' : null)} />
      <SubmitButton pending={formState.isSubmitting} idle={t('savePassword')} busy={t('sending')} />
    </form>
  )
}
