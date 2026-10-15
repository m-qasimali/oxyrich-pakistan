/**
 * Order pricing — pure functions shared by the order form preview and the
 * server action. The server always re-prices from the database; client prices
 * are only ever used for display.
 *
 * Returnable 19 L bottles:
 *  - A refundable deposit is charged for every returnable bottle delivered
 *    WITHOUT an empty being handed back (first order, or growing the fleet).
 *  - Each empty bottle returned on delivery cancels the deposit for one bottle.
 */

export type PricedProduct = {
  id: string
  name: string
  price: number
  depositAmount: number
  isReturnable: boolean
}

export type PricedLine = {
  product: PricedProduct
  qty: number
}

export type OrderQuote = {
  lines: {
    productId: string
    name: string
    qty: number
    unitPrice: number
    lineTotal: number
    depositPerUnit: number
    depositQty: number
    depositTotal: number
  }[]
  subtotal: number
  /** Number of returnable bottles in the order */
  returnableQty: number
  /** Empties applied as exchanges (clamped to returnableQty) */
  bottlesReturned: number
  depositTotal: number
  deliveryFee: number
  total: number
}

export function quoteOrder(
  lines: PricedLine[],
  options: { bottlesReturned?: number; deliveryFee?: number } = {},
): OrderQuote {
  const deliveryFee = Math.max(0, Math.trunc(options.deliveryFee ?? 0))
  const returnableQty = lines
    .filter((l) => l.product.isReturnable)
    .reduce((n, l) => n + Math.max(0, Math.trunc(l.qty)), 0)

  const bottlesReturned = Math.min(
    returnableQty,
    Math.max(0, Math.trunc(options.bottlesReturned ?? 0)),
  )

  // Apply returned empties to returnable lines in order.
  let exchangesLeft = bottlesReturned
  const priced = lines.map((l) => {
    const qty = Math.max(0, Math.trunc(l.qty))
    let depositQty = 0
    if (l.product.isReturnable && l.product.depositAmount > 0) {
      const exchanged = Math.min(qty, exchangesLeft)
      exchangesLeft -= exchanged
      depositQty = qty - exchanged
    } else if (l.product.isReturnable) {
      exchangesLeft -= Math.min(qty, exchangesLeft)
    }
    return {
      productId: l.product.id,
      name: l.product.name,
      qty,
      unitPrice: l.product.price,
      lineTotal: l.product.price * qty,
      depositPerUnit: l.product.isReturnable ? l.product.depositAmount : 0,
      depositQty,
      depositTotal: depositQty * (l.product.isReturnable ? l.product.depositAmount : 0),
    }
  })

  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0)
  const depositTotal = priced.reduce((s, l) => s + l.depositTotal, 0)

  return {
    lines: priced,
    subtotal,
    returnableQty,
    bottlesReturned,
    depositTotal,
    deliveryFee,
    total: subtotal + depositTotal + deliveryFee,
  }
}

/** Format whole rupees: 1250 → "Rs 1,250" */
export function formatPKR(amount: number): string {
  return `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`
}

export function formatOrderNumber(n: number): string {
  return `OX-${String(n).padStart(4, '0')}`
}
