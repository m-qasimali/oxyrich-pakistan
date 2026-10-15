import { getTranslations, setRequestLocale } from 'next-intl/server'
import { FileBadge, Microscope } from 'lucide-react'
import { PageHero } from '@/components/sections/section-heading'
import { Features } from '@/components/sections/features'
import { CtaBand } from '@/components/sections/cta-band'
import { Reveal } from '@/components/motion'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

/**
 * TODO: client to confirm — the old site only states "12-step filtration".
 * The step names below describe a typical bottled-water process and must be
 * checked against Oxyrich's actual plant before launch.
 */
const STEPS = Array.from({ length: 12 }, (_, i) => String(i + 1))

/** TODO: client to provide certificates (e.g. PSQCA / PFA) — none are claimed until supplied. */
const CERTIFICATE_SLOTS = ['PSQCA', 'PFA']

export async function generateMetadata({ params }: PageProps<'/[locale]/quality'>) {
  const { locale } = await params
  return pageMetadata(locale, '/quality', 'quality')
}

export default async function QualityPage({ params }: PageProps<'/[locale]/quality'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('quality')

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />
      <Features withHeading={false} />

      <section className="section pt-0" aria-labelledby="steps-title">
        <div className="container-page max-w-3xl">
          <h2 id="steps-title" className="text-center text-3xl font-bold sm:text-4xl">
            {t('stepsTitle')}
          </h2>
          <ol className="border-accent/40 relative ms-5 mt-12 border-s-2 border-dashed">
            {STEPS.map((n, i) => (
              <Reveal
                as="li"
                key={n}
                delay={Math.min(i, 4) * 0.05}
                className="relative ps-10 pb-10 last:pb-0"
              >
                <span className="from-accent to-ocean font-display ring-background absolute -start-[21px] top-0 flex size-10 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold text-white shadow-lg ring-4 shadow-sky-600/25">
                  <span className="ltr-nums">{n}</span>
                </span>
                <h3 className="pt-1.5 text-lg font-bold">{t(`steps.${n}.title`)}</h3>
                <p className="text-muted-foreground mt-1">{t(`steps.${n}.body`)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-muted/60">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="bg-card rounded-3xl border p-8">
            <Microscope className="text-accent-strong size-10" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold">{t('labTitle')}</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">{t('labBody')}</p>
          </div>
          <div className="bg-card rounded-3xl border p-8">
            <FileBadge className="text-accent-strong size-10" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold">{t('certsTitle')}</h2>
            <p className="text-muted-foreground mt-3">{t('certsBody')}</p>
            <ul className="mt-5 grid grid-cols-2 gap-4">
              {CERTIFICATE_SLOTS.map((c) => (
                <li
                  key={c}
                  className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center"
                >
                  <span className="font-display text-muted-foreground text-xl font-bold">{c}</span>
                  <span className="text-muted-foreground mt-1 text-xs">{t('certsPending')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
