import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthCard } from '@/components/auth-card'
import { ForgotPasswordForm } from '@/components/forms/auth-forms'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/forgot-password'>) {
  const { locale } = await params
  return pageMetadata(locale, '/forgot-password', 'forgot', { noindex: true })
}

export default async function ForgotPasswordPage({
  params,
}: PageProps<'/[locale]/forgot-password'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('auth')
  return (
    <AuthCard title={t('forgotTitle')} body={t('forgotBody')}>
      <ForgotPasswordForm />
    </AuthCard>
  )
}
