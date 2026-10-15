import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Award, Camera, Compass, Smile } from 'lucide-react'
import { PageHero } from '@/components/sections/section-heading'
import { StatsBand } from '@/components/sections/stats-band'
import { CtaBand } from '@/components/sections/cta-band'
import { getSiteSettings } from '@/lib/settings'
import { pageMetadata } from '@/lib/seo'
// TODO: replace with a real photo of Oxyrich customers/products (current image is stock from the old site).
import aboutImage from '../../../../../public/images/legacy/about-stock.jpg'

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params
  return pageMetadata(locale, '/about', 'about')
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const { stats } = await getSiteSettings()

  const pillars = [
    { icon: Smile, title: t('about.satisfiedTitle'), body: t('about.satisfiedBody') },
    { icon: Award, title: t('about.standardTitle'), body: t('about.standardBody') },
    { icon: Compass, title: t('about.approachTitle'), body: t('about.approachBody') },
  ]

  return (
    <>
      <PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} />
      <StatsBand />
      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[6/5] overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={aboutImage}
                alt={t('about.imageAlt')}
                placeholder="blur"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="bg-cta text-cta-foreground absolute start-6 -bottom-6 rounded-2xl px-6 py-4 shadow-lg">
              <p className="font-display text-3xl font-extrabold">
                {t('common.yearsPlus', { count: stats.yearsInBusiness })}
              </p>
              <p className="text-sm font-semibold">{t('stats.years')}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-lg leading-relaxed">{t('about.body')}</p>
            <div className="border-accent bg-secondary/60 mt-8 rounded-2xl border-s-4 p-6">
              <h2 className="text-xl font-bold">{t('about.missionTitle')}</h2>
              <p className="mt-2 leading-relaxed">{t('about.missionBody')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-muted/60">
        <div className="container-page">
          <ul className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-card rounded-2xl border p-7">
                <Icon className="text-accent-strong size-9" aria-hidden />
                <h2 className="mt-4 text-xl font-bold">{title}</h2>
                <p className="text-muted-foreground mt-2 leading-relaxed">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="team-title">
        <div className="container-page">
          <h2 id="team-title" className="text-center text-3xl font-bold">
            {t('about.teamTitle')}
          </h2>
          {/* TODO: client to provide team & facility photos. */}
          <ul className="mt-10 grid gap-5 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="bg-muted/40 text-muted-foreground flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed"
              >
                <Camera className="size-8" aria-hidden />
                <span className="text-sm">{t('about.photoSoon')}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
