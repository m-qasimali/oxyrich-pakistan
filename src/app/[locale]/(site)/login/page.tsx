import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthCard } from '@/components/auth-card'
import { LoginForm } from '@/components/forms/auth-forms'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from '@/i18n/navigation'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/login'>) {
  const { locale } = await params
  return pageMetadata(locale, '/login', 'login', { noindex: true })
}

export default async function LoginPage({ params, searchParams }: PageProps<'/[locale]/login'>) {
  const { locale } = await params
  setRequestLocale(locale)
  if (await getCurrentUser()) redirect({ href: '/account', locale })
  const t = await getTranslations('auth')
  const next = (await searchParams).next
  return (
    <AuthCard title={t('loginTitle')} body={t('loginBody')}>
      <LoginForm next={typeof next === 'string' ? next : undefined} />
    </AuthCard>
  )
}
