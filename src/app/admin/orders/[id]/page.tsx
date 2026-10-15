import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { formatOrderNumber, formatPKR } from '@/lib/pricing'
import { formatPhone, toWhatsAppNumber } from '@/lib/phone'
import { whatsappLink } from '@/lib/utils'
import { requireAdminPage } from '../../admin-guard'
import { OrderStatusButtons } from '../../admin-controls'
import { fmtDate, OrderStatus, PageTitle, Panel } from '../../ui'

export const metadata = { title: 'Order' }

export default async function AdminOrderDetail({ params }: PageProps<'/admin/orders/[id]'>) {
  await requireAdminPage()
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: true, bottleLedger: true, subscription: true },
  })
  if (!order) notFound()

  const rows: [string, React.ReactNode][] = [
    ['Customer', order.guestName],
    [
      'Phone',
      <a key="p" href={`tel:${order.guestPhone}`} className="text-accent-strong hover:underline">
        {formatPhone(order.guestPhone)}
      </a>,
    ],
    ['Sector', order.sector],
    ['Address', order.addressText],
    ['Notes', order.notes || '—'],
    ['Account', order.user ? `${order.user.name} (registered)` : 'Guest'],
    ['Source', order.source],
    ['Payment', 'Cash on delivery'],
    ['Placed', fmtDate(order.createdAt)],
    ['Delivered', order.deliveredAt ? fmtDate(order.deliveredAt) : '—'],
  ]

  return (
    <>
      <PageTitle title={`Order ${formatOrderNumber(order.number)}`}>
        <Link
          href="/admin/orders"
          className="text-accent-strong text-sm font-semibold hover:underline"
        >
          ← All orders
        </Link>
      </PageTitle>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel className="p-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 mb-3 font-bold">Items</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td className="py-2">
                    {i.qty} × {i.productName}
                  </td>
                  <td className="py-2 text-end tabular-nums">{formatPKR(i.unitPrice * i.qty)}</td>
                </tr>
              ))}
              <tr>
                <td className="text-muted-foreground py-2">
                  Bottle deposit ({order.bottlesReturned} empties returned)
                </td>
                <td className="py-2 text-end tabular-nums">{formatPKR(order.depositTotal)}</td>
              </tr>
              <tr>
                <td className="text-muted-foreground py-2">Delivery</td>
                <td className="py-2 text-end tabular-nums">
                  {order.deliveryFee ? formatPKR(order.deliveryFee) : 'Free'}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Total</td>
                <td className="py-2 text-end tabular-nums">{formatPKR(order.total)}</td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <div className="grid content-start gap-6">
          <Panel className="grid gap-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Status</h2>
              <OrderStatus status={order.status} />
            </div>
            <OrderStatusButtons orderId={order.id} status={order.status} />
            <a
              href={whatsappLink(
                toWhatsAppNumber(order.guestPhone),
                `Assalam o Alaikum ${order.guestName}, this is Oxyrich Pakistan about your order ${formatOrderNumber(order.number)}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-strong text-sm font-semibold hover:underline"
            >
              Message customer on WhatsApp →
            </a>
          </Panel>
          {order.bottleLedger.length > 0 ? (
            <Panel className="p-6">
              <h2 className="font-bold">Bottle ledger</h2>
              <ul className="mt-3 grid gap-1 text-sm">
                {order.bottleLedger.map((l) => (
                  <li key={l.id}>
                    {l.delta > 0 ? `+${l.delta}` : l.delta} · {l.reason.toLowerCase()}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  )
}
