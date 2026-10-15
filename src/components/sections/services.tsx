import { getTranslations } from 'next-intl/server'
import { Building2, Droplets, Factory, Home, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/motion'
import { SectionHeading } from './section-heading'

export const SERVICES = [
  { key: 'residential', anchor: 'residential', icon: Home, href: '/order', enquiry: null },
  {
    key: 'commercial',
    anchor: 'commercial',
    icon: Building2,
    href: '/services?type=COMMERCIAL#enquiry',
    enquiry: 'COMMERCIAL',
  },
  {
    key: 'filtrationPlant',
    anchor: 'filtration-plants',
    icon: Factory,
    href: '/services?type=FILTRATION_PLANT#enquiry',
    enquiry: 'FILTRATION_PLANT',
  },
  {
    key: 'softening',
    anchor: 'water-softening',
    icon: Droplets,
    href: '/services?type=SOFTENING#enquiry',
    enquiry: 'SOFTENING',
  },
] as const

export async function ServicesGrid({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const t = await getTranslations('services')
  const H = headingLevel
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICES.map(({ key, anchor, icon: Icon, href }, i) => (
        <Reveal as="li" key={key} delay={i * 0.08}>
          <div
            id={anchor}
            className="group bg-card flex h-full scroll-mt-28 flex-col rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-900/10"
          >
            <span className="bg-secondary text-primary dark:text-accent-strong flex size-12 items-center justify-center rounded-2xl">
              <Icon className="size-6" aria-hidden />
            </span>
            <H className="mt-5 text-lg font-bold">{t(`${key}.title`)}</H>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
              {t(`${key}.body`)}
            </p>
            <Link
              href={href}
              className="text-accent-strong mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              {t(`${key}.cta`)}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      ))}
    </ul>
  )
}

export async function ServicesSection() {
  const t = await getTranslations('home')
  return (
    <section className="section bg-muted/60" aria-labelledby="services-title">
      <div className="container-page">
        <SectionHeading
          id="services-title"
          eyebrow={t('servicesEyebrow')}
          title={t('servicesTitle')}
        />
        <div className="mt-12">
          <ServicesGrid />
        </div>
      </div>
    </section>
  )
}
