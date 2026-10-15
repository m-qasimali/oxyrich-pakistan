import { Badge } from '@/components/ui/badge'

const VARIANTS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  ACTIVE: 'success',
  PAUSED: 'warning',
  NEW: 'warning',
  CONTACTED: 'info',
  CLOSED: 'secondary',
} as const

export function StatusBadge({ status, label }: { status: keyof typeof VARIANTS; label: string }) {
  return <Badge variant={VARIANTS[status]}>{label}</Badge>
}
