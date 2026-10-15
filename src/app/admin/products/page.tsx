import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import { requireAdminPage } from '../admin-guard'
import { ProductEditor } from '../admin-controls'
import { PageTitle, Panel } from '../ui'

export const metadata = { title: 'Products & prices' }

export default async function AdminProducts() {
  await requireAdminPage()
  const [products, settings] = await Promise.all([
    db.product.findMany({ orderBy: { sortOrder: 'asc' } }),
    getSiteSettings(),
  ])
  return (
    <>
      <PageTitle title="Products & prices" />
      {settings.pricesConfirmed ? null : (
        <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-900/30 dark:text-amber-100">
          Prices are marked as <strong>indicative</strong> on the public site. Once real prices are
          entered below, tick “Prices confirmed” in Site settings.
        </p>
      )}
      <div className="grid gap-6">
        {products.map((p) => (
          <Panel key={p.id} className="p-6">
            <h2 className="mb-4 font-bold">
              {p.name} <span className="text-muted-foreground text-sm font-normal">/{p.slug}</span>
            </h2>
            <ProductEditor
              product={{
                id: p.id,
                name: p.name,
                summary: p.summary,
                description: p.description,
                price: p.price,
                depositAmount: p.depositAmount,
                packSize: p.packSize,
                isAvailable: p.isAvailable,
                sortOrder: p.sortOrder,
                isReturnable: p.isReturnable,
              }}
            />
          </Panel>
        ))}
      </div>
    </>
  )
}
