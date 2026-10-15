import Link from 'next/link'
import { db } from '@/lib/db'
import { formatOrderNumber, formatPKR } from '@/lib/pricing'
import { formatPhone } from '@/lib/phone'
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatusValue } from '@/lib/order-status'
import { cn } from '@/lib/utils'
import { requireAdminPage } from '../admin-guard'
import { OrderStatusButtons } from '../admin-controls'
import { fmtDate, OrderStatus, PageTitle, Table } from '../ui'

export const metadata = { title: 'Orders' }

export default async function AdminOrders({ searchParams }: PageProps<'/admin/orders'>) {
  await requireAdminPage()
  const { status: raw, q } = await searchParams
  const status = ORDER_STATUSES.includes(raw as OrderStatusValue)
    ? (raw as OrderStatusValue)
    : undefined
  const query = typeof q === 'string' ? q.trim() : ''

  const orders = await db.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query
        ? {
            OR: [
              { guestName: { contains: query, mode: 'insensitive' } },
              { guestPhone: { contains: query.replace(/\D/g, '') || query } },
              { sector: { contains: query, mode: 'insensitive' } },
              ...(/^\d+$/.test(query.replace(/^OX-?/i, ''))
                ? [{ number: Number(query.replace(/^OX-?/i, '')) }]
                : []),
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { items: true },
  })

  const tabs: { label: string; value?: OrderStatusValue }[] = [
    { label: 'All' },
    ...ORDER_STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s })),
  ]

  return (
    <>
      <PageTitle title="Orders">
        <form className="flex gap-2" action="/admin/orders">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, phone, sector, OX-…"
            aria-label="Search orders"
            className="bg-background h-10 w-64 rounded-xl border px-3 text-sm"
          />
        </form>
      </PageTitle>
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/orders?status=${t.value}` : '/admin/orders'}
            aria-current={status === t.value ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium',
              status === t.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted',
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-muted-foreground py-10 text-center">
                No orders found.
              </td>
            </tr>
          ) : null}
          {orders.map((o) => (
            <tr key={o.id} data-testid={`order-row-${o.number}`}>
              <td>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="text-accent-strong font-semibold hover:underline"
                >
                  {formatOrderNumber(o.number)}
                </Link>
                <div className="text-muted-foreground text-xs">{fmtDate(o.createdAt)}</div>
                <div className="text-muted-foreground text-xs">
                  {o.source.replace('_', ' ').toLowerCase()}
                </div>
              </td>
              <td>
                {o.guestName}
                <div className="text-xs">
                  <a href={`tel:${o.guestPhone}`} className="text-accent-strong hover:underline">
                    {formatPhone(o.guestPhone)}
                  </a>
                </div>
              </td>
              <td className="max-w-56">
                <span className="font-medium">{o.sector}</span>
                <div className="text-muted-foreground text-xs">{o.addressText}</div>
              </td>
              <td className="text-xs">
                {o.items.map((i) => (
                  <div key={i.id}>
                    {i.qty} × {i.productName}
                  </div>
                ))}
                {o.bottlesReturned > 0 ? (
                  <div className="text-muted-foreground">↺ {o.bottlesReturned} empties</div>
                ) : null}
              </td>
              <td className="tabular-nums">{formatPKR(o.total)}</td>
              <td>
                <OrderStatus status={o.status} />
              </td>
              <td>
                <OrderStatusButtons orderId={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
