import { getTranslations } from 'next-intl/server'
import { PageHero } from '@/components/sections/section-heading'

export type LegalSection = { heading: string; body: string[] }

/** Legal pages are English-only drafts (TODO: client/lawyer review before launch). */
export async function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: LegalSection[]
}) {
  const t = await getTranslations('legal')
  return (
    <>
      <PageHero title={title} body={t('updated', { date: updated })} />
      <section className="section pt-2" lang="en" dir="ltr">
        <div className="container-page max-w-3xl">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-900/30 dark:text-amber-100">
            {t('draftNote')}
          </p>
          <div className="mt-8 grid gap-8">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-xl font-bold">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-muted-foreground mt-3 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
