'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Menu, Phone, ShoppingBasket, UserRound } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { useSiteSettings } from '@/components/providers/settings-provider'
import { useCart } from '@/components/providers/cart-provider'
import { ThemeToggle } from '@/components/providers/theme'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { LanguageSwitcher } from './language-switcher'
import { TrackedLink } from './tracked-link'
import { PRIMARY_NAV } from './nav-links'

// The drawer (Radix Dialog) is only downloaded when the menu is first opened.
const MobileMenu = dynamic(() => import('./mobile-menu'), { ssr: false })

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function CartLink({ className }: { className?: string }) {
  const t = useTranslations('nav')
  const { count, ready } = useCart()
  return (
    <Link
      href="/order"
      aria-label={t('cartCount', { count: ready ? count : 0 })}
      className={cn(
        'text-foreground/80 hover:bg-muted hover:text-foreground relative inline-flex size-10 items-center justify-center rounded-xl transition-colors',
        className,
      )}
    >
      <ShoppingBasket className="size-5" aria-hidden />
      {ready && count > 0 ? (
        <span className="bg-cta text-cta-foreground absolute -end-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-5 font-bold">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}

export function Header() {
  const t = useTranslations('nav')
  const settings = useSiteSettings()
  const pathname = usePathname()
  const scrolled = useScrolled()
  const [open, setOpen] = React.useState(false)
  const [menuLoaded, setMenuLoaded] = React.useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'border-border/70 bg-background/85 border-b shadow-sm backdrop-blur-lg'
          : 'bg-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center gap-3 lg:h-20">
        <Link
          href="/"
          className="me-auto flex shrink-0 items-center rounded-lg lg:me-0"
          aria-label="Oxyrich Pakistan — home"
        >
          <Logo priority />
        </Link>

        <nav aria-label={t('mainNav')} className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'text-foreground/75 hover:text-foreground rounded-lg px-3 py-2 text-[15px] font-medium transition-colors',
                    isActive(item.href) && 'text-primary dark:text-accent-strong',
                  )}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <TrackedLink
            event="call_click"
            params={{ location: 'header' }}
            href={`tel:${settings.phoneE164}`}
            className="ltr-nums text-foreground/85 hover:text-foreground me-1 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold xl:px-3"
          >
            <Phone className="text-accent-strong size-4" aria-hidden />
            <span className="hidden xl:inline">{settings.phone}</span>
            <span className="sr-only xl:hidden">{t('call')}</span>
          </TrackedLink>
          <LanguageSwitcher />
          <ThemeToggle label={t('toggleTheme')} />
          <Link
            href="/account"
            aria-label={t('account')}
            className="text-foreground/80 hover:bg-muted hover:text-foreground inline-flex size-10 items-center justify-center rounded-xl"
          >
            <UserRound className="size-5" aria-hidden />
          </Link>
          <CartLink />
          <Button asChild variant="cta" className="ms-2">
            <Link href="/order">{t('orderNow')}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <CartLink />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('openMenu')}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setMenuLoaded(true)
              setOpen(true)
            }}
          >
            <Menu className="size-6" aria-hidden />
          </Button>
          {menuLoaded ? (
            <MobileMenu open={open} onOpenChange={setOpen} isActive={isActive} />
          ) : null}
        </div>
      </div>
    </header>
  )
}
