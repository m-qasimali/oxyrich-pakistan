import { getTranslations } from 'next-intl/server'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getSiteSettings } from '@/lib/settings'
import { whatsappLink } from '@/lib/utils'
import { Logo } from './logo'
import { TrackedLink } from './tracked-link'
import { WhatsAppIcon } from './whatsapp-icon'

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
}

export async function Footer() {
  const t = await getTranslations()
  const s = await getSiteSettings()
  const socials = Object.entries(s.social).filter(([, url]) => Boolean(url))

  const quickLinks = [
    { href: '/products', label: t('nav.products') },
    { href: '/subscriptions', label: t('nav.subscriptions') },
    { href: '/order', label: t('nav.orderNow') },
    { href: '/quality', label: t('nav.quality') },
    { href: '/about', label: t('nav.about') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/contact', label: t('nav.contact') },
  ]
  const services = [
    { href: '/services#residential', label: t('services.residential.title') },
    { href: '/services#commercial', label: t('services.commercial.title') },
    { href: '/services#filtration-plants', label: t('services.filtrationPlant.title') },
    { href: '/services#water-softening', label: t('services.softening.title') },
  ]

  return (
    <footer className="bg-ripple-dark pb-24 text-white/85 md:pb-0">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-4">
          <Link href="/" className="inline-block rounded-lg" aria-label="Oxyrich Pakistan — home">
            <Logo tone="light" className="h-12" />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">{t('footer.about')}</p>
          {socials.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-white">{t('footer.follow')}</p>
              <ul className="mt-2 flex flex-wrap gap-3 text-sm">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:text-white hover:underline"
                    >
                      {SOCIAL_LABELS[key] ?? key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <nav aria-label={t('footer.quickLinks')} className="lg:col-span-2">
          <h2 className="text-base font-semibold text-white">{t('footer.quickLinks')}</h2>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.services')} className="lg:col-span-3">
          <h2 className="text-base font-semibold text-white">{t('footer.services')}</h2>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {services.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-base font-semibold text-white">{t('footer.contact')}</h2>
          <address className="mt-4 grid gap-3 text-sm not-italic">
            <TrackedLink
              event="call_click"
              params={{ location: 'footer' }}
              href={`tel:${s.phoneE164}`}
              className="flex items-center gap-2.5 hover:text-white"
            >
              <Phone className="text-cta size-4" aria-hidden />
              <span className="ltr-nums">{s.phone}</span>
            </TrackedLink>
            <TrackedLink
              event="whatsapp_click"
              params={{ location: 'footer' }}
              href={whatsappLink(s.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 hover:text-white"
            >
              <WhatsAppIcon className="text-cta size-4" />
              <span>{t('nav.whatsapp')}</span>
            </TrackedLink>
            <a
              href={`mailto:${s.email}`}
              className="flex items-center gap-2.5 break-all hover:text-white"
            >
              <Mail className="text-cta size-4 shrink-0" aria-hidden />
              {s.email}
            </a>
            <p className="flex items-start gap-2.5">
              <MapPin className="text-cta mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="ltr-nums">
                {s.address.street}, {s.address.sector}, {s.address.city}, {s.address.country}
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <Clock className="text-cta size-4 shrink-0" aria-hidden />
              {s.is24x7 ? t('common.open247') : s.hoursLabel}
            </p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <ul className="flex gap-5">
            <li>
              <Link href="/privacy" className="hover:text-white">
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                {t('footer.terms')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
