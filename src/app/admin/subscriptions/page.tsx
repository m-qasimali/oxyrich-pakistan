import { db } from '@/lib/db'
import { formatPhone } from '@/lib/phone'
import { Badge } from '@/components/ui/badge'
import { requireAdminPage } from '../admin-guard'
import { SubscriptionAdminControls } from '../admin-controls'
import { fmtDay, PageTitle, Table } from '../ui'

export const metadata = { title: 'Subscriptions' }

export default async function AdminSubscriptions() {
  await requireAdminPage()
  const subs = await db.subscription.findMany({
    orderBy: [{ status: 'asc' }, { nextDeliveryDate: 'asc' }],
    include: { user: true, product: true },
    take: 300,
  })
  const endOfToday = new Date()
  endOfToday.setUTCHours(23, 59, 59, 999)

  return (
    <>
      <PageTitle title="Subscriptions" />
      <p className="text-muted-foreground mb-4 text-sm">
        Orders for due plans are created automatically each morning by the scheduled job. Use
        “Create next order” to create one manually.
      </p>
      <Table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Plan</th>
            <th>Address</th>
            <th>Next delivery</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subs.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-muted-foreground py-10 text-center">
                No subscriptions yet.
              </td>
            </tr>
          ) : null}
          {subs.map((s) => {
            const due = s.status === 'ACTIVE' && s.nextDeliveryDate <= endOfToday
            return (
              <tr key={s.id}>
                <td>
                  {s.user.name}
                  <div className="text-muted-foreground text-xs">{formatPhone(s.user.phone)}</div>
                </td>
                <td>
                  {s.qty} × {s.product.name}
                  <div className="text-muted-foreground text-xs">
                    {s.frequency === 'WEEKLY' ? 'Weekly' : 'Every 2 weeks'}
                  </div>
                </td>
                <td className="max-w-56">
                  <span className="font-medium">{s.sector}</span>
                  <div className="text-muted-foreground text-xs">{s.addressText}</div>
                </td>
                <td>
                  {fmtDay(s.nextDeliveryDate)} {due ? <Badge variant="warning">Due</Badge> : null}
                </td>
                <td>
                  <Badge
                    variant={
                      s.status === 'ACTIVE'
                        ? 'success'
                        : s.status === 'PAUSED'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {s.status.toLowerCase()}
                  </Badge>
                </td>
                <td>
                  <SubscriptionAdminControls id={s.id} status={s.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </>
  )
}
