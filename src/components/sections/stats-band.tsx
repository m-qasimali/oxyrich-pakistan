import { getTranslations } from 'next-intl/server'
import { Briefcase, Smile, Truck, Award } from 'lucide-react'
import { getSiteSettings } from '@/lib/settings'
import { CountUp } from '@/components/motion'

export async function StatsBand() {
  const t = await getTranslations('stats')
  const { stats } = await getSiteSettings()
  const items = [
    { icon: Smile, value: stats.happyClients, label: t('happyClients') },
    { icon: Truck, value: stats.vehicles, label: t('vehicles') },
    { icon: Briefcase, value: stats.employees, label: t('employees') },
    { icon: Award, value: stats.yearsInBusiness, label: t('years') },
  ]
  return (
    <section aria-label={t('title')} className="relative z-10 -mt-6 lg:-mt-12">
      <div className="container-page">
        <ul className="glass bg-border/60 grid grid-cols-2 gap-px overflow-hidden rounded-2xl lg:grid-cols-4">
          {items.map(({ icon: Icon, value, label }) => (
            <li key={label} className="bg-card/90 flex items-center gap-4 p-5 sm:p-7">
              <span className="bg-secondary text-accent-strong hidden size-12 shrink-0 items-center justify-center rounded-2xl sm:flex">
                <Icon className="size-6" aria-hidden />
              </span>
              <div>
                <p className="font-display text-primary text-3xl font-extrabold sm:text-4xl dark:text-white">
                  <CountUp value={value} suffix="+" />
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm font-medium">{label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
