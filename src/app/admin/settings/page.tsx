import { getSiteSettings } from '@/lib/settings'
import { requireAdminPage } from '../admin-guard'
import { SettingsForm } from '../admin-controls'
import { PageTitle } from '../ui'

export const metadata = { title: 'Site settings' }

export default async function AdminSettings() {
  await requireAdminPage()
  const settings = await getSiteSettings()
  return (
    <>
      <PageTitle title="Site settings" />
      <p className="text-muted-foreground mb-6 max-w-2xl text-sm">
        These details appear across the whole website — header, footer, contact page, WhatsApp
        buttons and Google search data. Changes go live within a few seconds.
      </p>
      <SettingsForm settings={settings} />
    </>
  )
}
