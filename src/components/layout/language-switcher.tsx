'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const target = locale === 'en' ? 'ur' : 'en'
  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      lang={target}
      aria-label={t('switchToLabel')}
      className={cn(
        'text-foreground/80 hover:bg-muted hover:text-foreground inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors',
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      <span className={target === 'ur' ? 'font-urdu text-base leading-none' : ''}>
        {t('switchTo')}
      </span>
    </Link>
  )
}
