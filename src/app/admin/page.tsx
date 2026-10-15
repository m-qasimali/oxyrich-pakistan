import Link from 'next/link'
import { db } from '@/lib/db'
import { formatOrderNumber, formatPKR } from '@/lib/pricing'
import { formatPhone } from '@/lib/phone'
import { requireAdminPage } from './admin-guard'
import { fmtDate, OrderStatus, PageTitle, Panel, Table } from './ui'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  await requireAdminPage()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const [pending, inProgress, today, newEnquiries, activeSubs, dueSubs, recent] = await Promise.all(
    [
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({ where: { status: { in: ['CONFIRMED', 'OUT_FOR_DELIVERY'] } } }),
      db.order.aggregate({
        where: { createdAt: { gte: startOfDay }, status: { not: 'CANCELLED' } },
        _count: true,
        _sum: { total: true },
      }),
      db.enquiry.count({ where: { status: 'NEW' } }),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.subscription.count({ where: { status: 'ACTIVE', nextDeliveryDate: { lte: endOfToday } } }),
      db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ],
  )

  const cards = [
    {
      label: 'Pending orders',
      value: pending,
      href: '/admin/orders?status=PENDING',
      highlight: pending > 0,
    },
    { label: 'In progress', value: inProgress, href: '/admin/orders?status=CONFIRMED' },
    {
      label: "Today's orders",
      value: today._count,
      sub: formatPKR(today._sum.total ?? 0),
      href: '/admin/orders',
    },
    {
      label: 'New enquiries',
      value: newEnquiries,
      href: '/admin/enquiries',
      highlight: newEnquiries > 0,
    },
    {
      label: 'Active plans',
      value: activeSubs,
      sub: `${dueSubs} due today`,
      href: '/admin/subscriptions',
      highlight: dueSubs > 0,
    },
  ]

  return (
    <>
      <PageTitle title="Dashboard" />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block">
              <Panel
                className={
                  c.highlight ? 'border-amber-300 bg-amber-50 p-5 dark:bg-amber-900/20' : 'p-5'
                }
              >
                <p className="text-muted-foreground text-sm">{c.label}</p>
                <p className="font-display mt-1 text-3xl font-extrabold">{c.value}</p>
                {c.sub ? <p className="text-muted-foreground text-xs">{c.sub}</p> : null}
              </Panel>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 mb-4 text-lg font-bold">Recent orders</h2>
      <Table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Sector</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((o) => (
            <tr key={o.id}>
              <td>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="text-accent-strong font-semibold hover:underline"
                >
                  {formatOrderNumber(o.number)}
                </Link>
              </td>
              <td>
                {o.guestName}
                <div className="text-muted-foreground text-xs">{formatPhone(o.guestPhone)}</div>
              </td>
              <td>{o.sector}</td>
              <td className="tabular-nums">{formatPKR(o.total)}</td>
              <td>
                <OrderStatus status={o.status} />
              </td>
              <td className="text-muted-foreground">{fmtDate(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
