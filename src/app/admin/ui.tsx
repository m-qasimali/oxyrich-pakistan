import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, type OrderStatusValue } from '@/lib/order-status'

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  )
}

export function Panel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('bg-card rounded-2xl border', className)} {...props} />
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card overflow-x-auto rounded-2xl border">
      <table className="[&_th]:text-muted-foreground w-full min-w-[720px] text-sm [&_tbody_tr]:border-t [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_th]:px-4 [&_th]:py-3 [&_th]:text-start [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:uppercase">
        {children}
      </table>
    </div>
  )
}

const ORDER_VARIANT = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
} as const

export function OrderStatus({ status }: { status: OrderStatusValue }) {
  return <Badge variant={ORDER_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>
}

export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Karachi',
  }).format(d)

export const fmtDay = (d: Date) =>
  new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeZone: 'UTC' }).format(d)
