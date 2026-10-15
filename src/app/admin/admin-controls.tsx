'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect, Textarea } from '@/components/ui/input'
import { nextStatuses, STATUS_LABELS, type OrderStatusValue } from '@/lib/order-status'
import type { SiteSettings } from '@/config/site'
import {
  adjustBottles,
  createSubscriptionOrderNow,
  createTestimonial,
  deleteTestimonial,
  setEnquiryStatus,
  setSubscriptionStatus,
  setTestimonialPublished,
  setUserRole,
  updateOrderStatus,
  updateProduct,
  updateSettings,
} from '@/server/actions/admin'

type Result = { ok: true } | { ok: false; error: string }

/** Run a server action in a transition, toast the outcome, refresh server data. */
function useAdminAction() {
  const router = useRouter()
  const [pending, start] = React.useTransition()
  const run = (fn: () => Promise<Result>, success = 'Saved') =>
    start(async () => {
      try {
        const res = await fn()
        if (res.ok) {
          toast.success(success)
          router.refresh()
        } else toast.error(res.error)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  return { pending, run }
}

const label = 'text-xs font-semibold text-muted-foreground'

export function OrderStatusButtons({
  orderId,
  status,
}: {
  orderId: string
  status: OrderStatusValue
}) {
  const { pending, run } = useAdminAction()
  const next = nextStatuses(status)
  if (next.length === 0) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {next.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={s === 'CANCELLED' ? 'ghost' : 'default'}
          disabled={pending}
          onClick={() =>
            run(
              () => updateOrderStatus(orderId, s),
              `Order marked ${STATUS_LABELS[s].toLowerCase()}`,
            )
          }
          data-testid={`status-${s}`}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {s === 'CANCELLED' ? 'Cancel' : `Mark ${STATUS_LABELS[s].toLowerCase()}`}
        </Button>
      ))}
    </div>
  )
}

export type AdminProduct = {
  id: string
  name: string
  summary: string
  description: string
  price: number
  depositAmount: number
  packSize: number
  isAvailable: boolean
  sortOrder: number
  isReturnable: boolean
}

export function ProductEditor({ product }: { product: AdminProduct }) {
  const { pending, run } = useAdminAction()
  const [v, setV] = React.useState(product)
  const set = <K extends keyof AdminProduct>(k: K, val: AdminProduct[K]) =>
    setV((p) => ({ ...p, [k]: val }))
  const id = (f: string) => `${product.id}-${f}`
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => updateProduct(v), `${v.name} saved`)
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5 sm:col-span-2">
          <label htmlFor={id('name')} className={label}>
            Name
          </label>
          <Input id={id('name')} value={v.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={id('price')} className={label}>
            Price (PKR per {v.packSize > 1 ? 'carton' : 'bottle'})
          </label>
          <Input
            id={id('price')}
            type="number"
            min={0}
            value={v.price}
            onChange={(e) => set('price', Number(e.target.value))}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={id('pack')} className={label}>
            Bottles per unit
          </label>
          <Input
            id={id('pack')}
            type="number"
            min={1}
            value={v.packSize}
            onChange={(e) => set('packSize', Number(e.target.value))}
          />
        </div>
        {v.isReturnable ? (
          <div className="grid gap-1.5">
            <label htmlFor={id('deposit')} className={label}>
              Deposit per bottle (PKR)
            </label>
            <Input
              id={id('deposit')}
              type="number"
              min={0}
              value={v.depositAmount}
              onChange={(e) => set('depositAmount', Number(e.target.value))}
            />
          </div>
        ) : null}
        <div className="grid gap-1.5">
          <label htmlFor={id('sort')} className={label}>
            Sort order
          </label>
          <Input
            id={id('sort')}
            type="number"
            min={0}
            value={v.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium">
          <input
            type="checkbox"
            className="accent-primary size-4"
            checked={v.isAvailable}
            onChange={(e) => set('isAvailable', e.target.checked)}
          />
          Available to order
        </label>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={id('summary')} className={label}>
          Short summary
        </label>
        <Input
          id={id('summary')}
          value={v.summary}
          onChange={(e) => set('summary', e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={id('desc')} className={label}>
          Description
        </label>
        <Textarea
          id={id('desc')}
          rows={4}
          value={v.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Save product
        </Button>
      </div>
    </form>
  )
}

export function SubscriptionAdminControls({
  id,
  status,
}: {
  id: string
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
}) {
  const { pending, run } = useAdminAction()
  if (status === 'CANCELLED') return <span className="text-muted-foreground text-xs">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {status === 'ACTIVE' ? (
        <>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const res = await createSubscriptionOrderNow(id)
                return res.ok ? { ok: true } : res
              }, 'Order created and next date advanced')
            }
          >
            Create next order
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => setSubscriptionStatus(id, 'PAUSED'), 'Paused')}
          >
            Pause
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => setSubscriptionStatus(id, 'ACTIVE'), 'Resumed')}
        >
          Resume
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run(() => setSubscriptionStatus(id, 'CANCELLED'), 'Cancelled')}
      >
        Cancel
      </Button>
    </div>
  )
}

export function BottleAdjust({ userId }: { userId: string }) {
  const { pending, run } = useAdminAction()
  const [delta, setDelta] = React.useState('')
  const [note, setNote] = React.useState('')
  return (
    <form
      className="flex flex-wrap items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault()
        run(
          () => adjustBottles(userId, Number.parseInt(delta, 10), note),
          'Bottle balance adjusted',
        )
        setDelta('')
        setNote('')
      }}
    >
      <Input
        aria-label="Bottle adjustment (+/-)"
        placeholder="±"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        className="h-9 w-16"
        inputMode="numeric"
      />
      <Input
        aria-label="Reason"
        placeholder="Reason"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="h-9 w-32"
      />
      <Button size="sm" variant="outline" disabled={pending || !delta}>
        Adjust
      </Button>
    </form>
  )
}

export function RoleToggle({ userId, role }: { userId: string; role: 'CUSTOMER' | 'ADMIN' }) {
  const { pending, run } = useAdminAction()
  const next = role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => run(() => setUserRole(userId, next), `Role set to ${next.toLowerCase()}`)}
    >
      {role === 'ADMIN' ? 'Remove admin' : 'Make admin'}
    </Button>
  )
}

export function EnquiryStatusSelect({
  id,
  status,
}: {
  id: string
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
}) {
  const { pending, run } = useAdminAction()
  return (
    <NativeSelect
      aria-label="Enquiry status"
      className="h-9 w-36 text-sm"
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        run(() => setEnquiryStatus(id, e.target.value as typeof status), 'Status updated')
      }
    >
      <option value="NEW">New</option>
      <option value="CONTACTED">Contacted</option>
      <option value="CLOSED">Closed</option>
    </NativeSelect>
  )
}

export function TestimonialControls({ id, isPublished }: { id: string; isPublished: boolean }) {
  const { pending, run } = useAdminAction()
  const [confirm, setConfirm] = React.useState(false)
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(() => setTestimonialPublished(id, !isPublished), isPublished ? 'Hidden' : 'Published')
        }
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      {confirm ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => run(() => deleteTestimonial(id), 'Deleted')}
        >
          Confirm delete
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>
          Delete
        </Button>
      )}
    </div>
  )
}

export function NewTestimonialForm() {
  const { pending, run } = useAdminAction()
  const [v, setV] = React.useState({ name: '', text: '', rating: 5 })
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => createTestimonial(v), 'Testimonial added')
        setV({ name: '', text: '', rating: 5 })
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <Input
          aria-label="Customer name"
          placeholder="Customer name"
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
        />
        <NativeSelect
          aria-label="Rating"
          value={v.rating}
          onChange={(e) => setV({ ...v, rating: Number(e.target.value) })}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ★
            </option>
          ))}
        </NativeSelect>
      </div>
      <Textarea
        aria-label="Testimonial"
        placeholder="What did they say?"
        rows={3}
        value={v.text}
        onChange={(e) => setV({ ...v, text: e.target.value })}
      />
      <div>
        <Button type="submit" disabled={pending}>
          Add testimonial
        </Button>
      </div>
    </form>
  )
}

function serializeAreas(groups: SiteSettings['deliveryAreas']) {
  return groups.map((g) => `${g.group}: ${g.areas.join(', ')}`).join('\n')
}
function parseAreas(text: string): SiteSettings['deliveryAreas'] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [group, rest = ''] = line.split(':')
      return {
        group: (group ?? '').trim(),
        areas: rest
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      }
    })
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { pending, run } = useAdminAction()
  const [s, setS] = React.useState(settings)
  const [areas, setAreas] = React.useState(serializeAreas(settings.deliveryAreas))

  const text = (
    labelText: string,
    value: string,
    onChange: (v: string) => void,
    idName: string,
  ) => (
    <div className="grid gap-1.5">
      <label htmlFor={idName} className={label}>
        {labelText}
      </label>
      <Input id={idName} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
  const num = (labelText: string, value: number, onChange: (v: number) => void, idName: string) => (
    <div className="grid gap-1.5">
      <label htmlFor={idName} className={label}>
        {labelText}
      </label>
      <Input
        id={idName}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
  const check = (labelText: string, value: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        className="accent-primary size-4"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {labelText}
    </label>
  )

  return (
    <form
      className="grid gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        run(
          () => updateSettings({ ...s, deliveryAreas: parseAreas(areas) }),
          'Settings saved — the site will update within seconds',
        )
      }}
    >
      <fieldset className="bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <legend className="px-2 font-bold">Contact</legend>
        {text(
          'Business name',
          s.businessName,
          (v) => setS({ ...s, businessName: v }),
          'businessName',
        )}
        {text('Email', s.email, (v) => setS({ ...s, email: v }), 'email')}
        {text('Phone (display)', s.phone, (v) => setS({ ...s, phone: v }), 'phone')}
        {text(
          'Phone (E.164, for tel: links)',
          s.phoneE164,
          (v) => setS({ ...s, phoneE164: v }),
          'phoneE164',
        )}
        {text(
          'WhatsApp number (92XXXXXXXXXX)',
          s.whatsappNumber,
          (v) => setS({ ...s, whatsappNumber: v }),
          'whatsappNumber',
        )}
        {text('Hours label', s.hoursLabel, (v) => setS({ ...s, hoursLabel: v }), 'hoursLabel')}
        {check('Open 24/7', s.is24x7, (v) => setS({ ...s, is24x7: v }))}
      </fieldset>

      <fieldset className="bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <legend className="px-2 font-bold">Address & map</legend>
        {text(
          'Street',
          s.address.street,
          (v) => setS({ ...s, address: { ...s.address, street: v } }),
          'street',
        )}
        {text(
          'Sector',
          s.address.sector,
          (v) => setS({ ...s, address: { ...s.address, sector: v } }),
          'sector',
        )}
        {text(
          'City',
          s.address.city,
          (v) => setS({ ...s, address: { ...s.address, city: v } }),
          'city',
        )}
        {text(
          'Country',
          s.address.country,
          (v) => setS({ ...s, address: { ...s.address, country: v } }),
          'country',
        )}
        {num('Latitude', s.geo.lat, (v) => setS({ ...s, geo: { ...s.geo, lat: v } }), 'lat')}
        {num('Longitude', s.geo.lng, (v) => setS({ ...s, geo: { ...s.geo, lng: v } }), 'lng')}
      </fieldset>

      <fieldset className="bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2 lg:grid-cols-4">
        <legend className="px-2 font-bold">Stats (home & about pages)</legend>
        {num(
          'Happy clients',
          s.stats.happyClients,
          (v) => setS({ ...s, stats: { ...s.stats, happyClients: v } }),
          'happyClients',
        )}
        {num(
          'Delivery vehicles',
          s.stats.vehicles,
          (v) => setS({ ...s, stats: { ...s.stats, vehicles: v } }),
          'vehicles',
        )}
        {num(
          'Employees',
          s.stats.employees,
          (v) => setS({ ...s, stats: { ...s.stats, employees: v } }),
          'employees',
        )}
        {num(
          'Years in business',
          s.stats.yearsInBusiness,
          (v) => setS({ ...s, stats: { ...s.stats, yearsInBusiness: v } }),
          'years',
        )}
      </fieldset>

      <fieldset className="bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <legend className="px-2 font-bold">Delivery & pricing</legend>
        {check('Free delivery', s.freeDelivery, (v) =>
          setS({ ...s, freeDelivery: v, deliveryFee: v ? 0 : s.deliveryFee }),
        )}
        {num(
          'Delivery fee (PKR, 0 = free)',
          s.deliveryFee,
          (v) => setS({ ...s, deliveryFee: v }),
          'deliveryFee',
        )}
        {check(
          'Prices confirmed (hides the "indicative price" note and publishes prices to Google)',
          s.pricesConfirmed,
          (v) => setS({ ...s, pricesConfirmed: v }),
        )}
        <div className="grid gap-1.5 sm:col-span-2">
          <label htmlFor="areas" className={label}>
            Delivery areas — one group per line, e.g. “G sectors: G-6, G-7”
          </label>
          <Textarea
            id="areas"
            rows={7}
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <legend className="px-2 font-bold">Social links (leave empty to hide)</legend>
        {(['facebook', 'instagram', 'tiktok', 'youtube'] as const).map((k) =>
          text(
            k[0]!.toUpperCase() + k.slice(1),
            s.social[k],
            (v) => setS({ ...s, social: { ...s.social, [k]: v } }),
            k,
          ),
        )}
      </fieldset>

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Save settings
        </Button>
      </div>
    </form>
  )
}
