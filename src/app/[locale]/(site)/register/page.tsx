import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthCard } from '@/components/auth-card'
import { RegisterForm } from '@/components/forms/auth-forms'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from '@/i18n/navigation'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/register'>) {
  const { locale } = await params
  return pageMetadata(locale, '/register', 'register', { noindex: true })
}

export default async function RegisterPage({ params }: PageProps<'/[locale]/register'>) {
  const { locale } = await params
  setRequestLocale(locale)
  if (await getCurrentUser()) redirect({ href: '/account', locale })
  const t = await getTranslations('auth')
  return (
    <AuthCard title={t('registerTitle')} body={t('registerBody')}>
      <RegisterForm />
    </AuthCard>
  )
}
