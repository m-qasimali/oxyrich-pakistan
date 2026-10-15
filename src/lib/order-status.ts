export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const
export type OrderStatusValue = (typeof ORDER_STATUSES)[number]

/** pending → confirmed → out for delivery → delivered; cancel any time before delivery. */
const TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function nextStatuses(status: OrderStatusValue): OrderStatusValue[] {
  return TRANSITIONS[status]
}

export function canTransition(from: OrderStatusValue, to: OrderStatusValue): boolean {
  return TRANSITIONS[from].includes(to)
}

export const STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}
