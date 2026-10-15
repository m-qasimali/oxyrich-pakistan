import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthCard } from '@/components/auth-card'
import { ResetPasswordForm } from '@/components/forms/auth-forms'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/reset-password'>) {
  const { locale } = await params
  return pageMetadata(locale, '/reset-password', 'reset', { noindex: true })
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<'/[locale]/reset-password'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('auth')
  const token = (await searchParams).token
  return (
    <AuthCard title={t('resetTitle')}>
      {typeof token === 'string' && token.length >= 20 ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="grid gap-4">
          <p role="alert" className="text-destructive">
            {t('resetInvalid')}
          </p>
          <Button asChild>
            <Link href="/forgot-password">{t('sendReset')}</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  )
}
