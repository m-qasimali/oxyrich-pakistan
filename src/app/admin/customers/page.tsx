import { db } from '@/lib/db'
import { formatPhone } from '@/lib/phone'
import { Badge } from '@/components/ui/badge'
import { requireAdminPage } from '../admin-guard'
import { BottleAdjust, RoleToggle } from '../admin-controls'
import { fmtDate, PageTitle, Table } from '../ui'

export const metadata = { title: 'Customers' }

export default async function AdminCustomers({ searchParams }: PageProps<'/admin/customers'>) {
  await requireAdminPage()
  const { q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''
  const users = await db.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query.replace(/\D/g, '') || query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { _count: { select: { orders: true, subscriptions: true } } },
  })
  const balances = await db.bottleLedger.groupBy({
    by: ['userId'],
    where: { userId: { in: users.map((u) => u.id) } },
    _sum: { delta: true },
  })
  const balanceOf = new Map(balances.map((b) => [b.userId, b._sum.delta ?? 0]))

  return (
    <>
      <PageTitle title="Customers">
        <form action="/admin/customers">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or phone"
            aria-label="Search customers"
            className="bg-background h-10 w-64 rounded-xl border px-3 text-sm"
          />
        </form>
      </PageTitle>
      <Table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Joined</th>
            <th>Orders</th>
            <th>Plans</th>
            <th>Bottles held</th>
            <th>Adjust bottles</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.name}
                <div className="text-muted-foreground text-xs">
                  {formatPhone(u.phone)}
                  {u.email ? ` · ${u.email}` : ''}
                </div>
              </td>
              <td className="text-muted-foreground">{fmtDate(u.createdAt)}</td>
              <td className="tabular-nums">{u._count.orders}</td>
              <td className="tabular-nums">{u._count.subscriptions}</td>
              <td className="font-semibold tabular-nums">{balanceOf.get(u.id) ?? 0}</td>
              <td>
                <BottleAdjust userId={u.id} />
              </td>
              <td className="whitespace-nowrap">
                {u.role === 'ADMIN' ? <Badge>Admin</Badge> : null}{' '}
                <RoleToggle userId={u.id} role={u.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
