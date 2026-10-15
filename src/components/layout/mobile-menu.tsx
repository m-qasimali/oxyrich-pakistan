'use client'

import { useTranslations } from 'next-intl'
import { UserRound } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { ThemeToggle } from '@/components/providers/theme'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn, whatsappLink } from '@/lib/utils'
import { WHATSAPP_ORDER_MESSAGE } from '@/config/site'
import { Logo } from './logo'
import { LanguageSwitcher } from './language-switcher'
import { TrackedLink } from './tracked-link'
import { MOBILE_NAV } from './nav-links'

/** Mobile navigation drawer. Loaded on first tap of the menu button (see header.tsx). */
export default function MobileMenu({
  open,
  onOpenChange,
  isActive,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isActive: (href: string) => boolean
}) {
  const t = useTranslations('nav')
  const settings = useSiteSettings()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent closeLabel={t('closeMenu')} aria-describedby={undefined}>
        <SheetTitle className="sr-only">{t('mainNav')}</SheetTitle>
        <div className="pt-1">
          <Logo />
        </div>
        <nav aria-label={t('mainNav')} className="mt-2">
          <ul className="grid gap-0.5">
            {MOBILE_NAV.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'hover:bg-muted flex min-h-12 items-center rounded-xl px-3 text-base font-medium',
                      isActive(item.href) && 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </SheetClose>
              </li>
            ))}
            <li>
              <SheetClose asChild>
                <Link
                  href="/account"
                  className="hover:bg-muted flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-medium"
                >
                  <UserRound className="size-5" aria-hidden />
                  {t('account')}
                </Link>
              </SheetClose>
            </li>
          </ul>
        </nav>
        <div className="mt-auto grid gap-2">
          <div className="bg-muted flex items-center justify-between rounded-xl px-2 py-1">
            <LanguageSwitcher />
            <ThemeToggle label={t('toggleTheme')} />
          </div>
          <SheetClose asChild>
            <Button asChild variant="cta" size="lg">
              <Link href="/order">{t('orderNow')}</Link>
            </Button>
          </SheetClose>
          <Button asChild variant="whatsapp" size="lg">
            <TrackedLink
              event="whatsapp_click"
              params={{ location: 'mobile_menu' }}
              href={whatsappLink(settings.whatsappNumber, WHATSAPP_ORDER_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('whatsapp')}
            </TrackedLink>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
