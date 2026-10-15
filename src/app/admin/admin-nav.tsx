'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarClock,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { logout } from '@/server/actions/auth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CalendarClock },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/products', label: 'Products & prices', icon: Package },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/settings', label: 'Site settings', icon: Settings },
]

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <aside className="bg-primary text-primary-foreground border-b lg:sticky lg:top-0 lg:h-screen lg:border-e lg:border-b-0">
      <div className="flex items-center justify-between gap-2 px-5 py-4">
        <Link href="/admin" className="font-display text-lg font-extrabold">
          Oxyrich <span className="text-cta">Admin</span>
        </Link>
      </div>
      <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:pb-0">
        <ul className="flex gap-1 lg:flex-col">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white',
                    active && 'bg-white/15 text-white',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="hidden px-5 py-6 text-sm lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
        <p className="text-white/70">Signed in as</p>
        <p className="font-semibold">{userName}</p>
        <div className="mt-3 flex flex-col gap-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ExternalLink className="size-4" aria-hidden /> View site
          </a>
          <button
            type="button"
            onClick={async () => {
              await logout()
              router.replace('/login')
              router.refresh()
            }}
            className="flex items-center gap-2 text-start text-white/80 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden /> Log out
          </button>
        </div>
      </div>
    </aside>
  )
}
