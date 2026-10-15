'use client'

import * as React from 'react'

export type CartItem = { productId: string; qty: number }

type CartContextValue = {
  items: CartItem[]
  count: number
  ready: boolean
  add: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const STORAGE_KEY = 'oxyrich-cart-v1'
const CartContext = React.createContext<CartContextValue | null>(null)

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (i): i is CartItem =>
          typeof i?.productId === 'string' && Number.isInteger(i?.qty) && i.qty > 0,
      )
      .slice(0, 20)
  } catch {
    return []
  }
}

/** Client-side order basket persisted to localStorage. Prices are never stored here. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    // Hydrate from storage after mount to avoid server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(read())
    setReady(true)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = React.useCallback((fn: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = fn(prev).filter((i) => i.qty > 0)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* storage full or disabled — cart still works for this page view */
      }
      return next
    })
  }, [])

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      add: (productId, qty = 1) =>
        update((prev) =>
          prev.some((i) => i.productId === productId)
            ? prev.map((i) =>
                i.productId === productId ? { ...i, qty: Math.min(200, i.qty + qty) } : i,
              )
            : [...prev, { productId, qty }],
        ),
      setQty: (productId, qty) =>
        update((prev) =>
          prev.map((i) =>
            i.productId === productId ? { ...i, qty: Math.max(0, Math.min(200, qty)) } : i,
          ),
        ),
      remove: (productId) => update((prev) => prev.filter((i) => i.productId !== productId)),
      clear: () => update(() => []),
    }),
    [items, ready, update],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
