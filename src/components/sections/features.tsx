import { getTranslations } from 'next-intl/server'
import { Atom, Filter, Microscope, ShieldCheck, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/motion'
import { SectionHeading } from './section-heading'

export const FEATURE_KEYS = [
  { key: 'qualityCheck', icon: ShieldCheck },
  { key: 'filtration', icon: Filter },
  { key: 'composition', icon: Atom },
  { key: 'labControl', icon: Microscope },
] as const

export async function Features({ withHeading = true }: { withHeading?: boolean }) {
  const t = await getTranslations()
  // Without the section heading the cards sit directly under the page h1.
  const H = withHeading ? 'h3' : 'h2'
  return (
    <section className="section" aria-labelledby={withHeading ? 'features-title' : undefined}>
      <div className="container-page">
        {withHeading ? (
          <SectionHeading
            id="features-title"
            eyebrow={t('home.featuresEyebrow')}
            title={t('home.featuresTitle')}
            body={t('home.featuresBody')}
          />
        ) : null}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map(({ key, icon: Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 0.08}>
              <div className="bg-card hover:border-accent/60 h-full rounded-2xl border p-6 transition-colors">
                <span className="from-accent to-ocean flex size-12 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg shadow-sky-600/20">
                  <Icon className="size-6" aria-hidden />
                </span>
                <H className="mt-5 text-lg font-bold">{t(`features.${key}.title`)}</H>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t(`features.${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
        {withHeading ? (
          <div className="mt-10 text-center">
            <Link
              href="/quality"
              className="text-accent-strong inline-flex items-center gap-1.5 font-semibold hover:underline"
            >
              {t('nav.quality')}: {t('quality.stepsTitle')}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
