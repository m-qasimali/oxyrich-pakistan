import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/error-state'

export default function NotFound() {
  const t = useTranslations()
  return (
    <>
      <title>{`${t('meta.notFound.title')} | ${t('meta.siteName')}`}</title>
      <meta name="robots" content="noindex" />
      <ErrorState code="404" title={t('errors.notFoundTitle')} body={t('errors.notFoundBody')}>
        <Button asChild variant="cta" size="lg">
          <Link href="/">{t('errors.goHome')}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products">{t('nav.products')}</Link>
        </Button>
      </ErrorState>
    </>
  )
}
