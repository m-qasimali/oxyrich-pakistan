import { describe, expect, it } from 'vitest'
import { formatOrderNumber, formatPKR, quoteOrder, type PricedProduct } from '@/lib/pricing'

const bottle19: PricedProduct = {
  id: '19',
  name: '19 Litre Bottle',
  price: 250,
  depositAmount: 1000,
  isReturnable: true,
}
const carton15: PricedProduct = {
  id: '15',
  name: '1.5 Litre Bottles',
  price: 480,
  depositAmount: 0,
  isReturnable: false,
}

describe('quoteOrder', () => {
  it('charges a deposit for every new returnable bottle on a first order', () => {
    const q = quoteOrder([{ product: bottle19, qty: 2 }])
    expect(q.subtotal).toBe(500)
    expect(q.depositTotal).toBe(2000)
    expect(q.total).toBe(2500)
  })

  it('waives the deposit for each empty bottle exchanged', () => {
    const q = quoteOrder([{ product: bottle19, qty: 3 }], { bottlesReturned: 2 })
    expect(q.bottlesReturned).toBe(2)
    expect(q.depositTotal).toBe(1000)
    expect(q.total).toBe(750 + 1000)
  })

  it('clamps returned bottles to the number of returnable bottles ordered', () => {
    const q = quoteOrder([{ product: bottle19, qty: 1 }], { bottlesReturned: 5 })
    expect(q.bottlesReturned).toBe(1)
    expect(q.depositTotal).toBe(0)
  })

  it('never charges a deposit on disposable cartons', () => {
    const q = quoteOrder(
      [
        { product: carton15, qty: 2 },
        { product: bottle19, qty: 1 },
      ],
      { bottlesReturned: 1 },
    )
    expect(q.returnableQty).toBe(1)
    expect(q.depositTotal).toBe(0)
    expect(q.subtotal).toBe(960 + 250)
  })

  it('ignores negative and fractional input', () => {
    const q = quoteOrder([{ product: bottle19, qty: 2.7 }], {
      bottlesReturned: -3,
      deliveryFee: -50,
    })
    expect(q.lines[0]!.qty).toBe(2)
    expect(q.bottlesReturned).toBe(0)
    expect(q.deliveryFee).toBe(0)
  })

  it('adds the delivery fee to the total', () => {
    expect(quoteOrder([{ product: carton15, qty: 1 }], { deliveryFee: 100 }).total).toBe(580)
  })
})

describe('formatting', () => {
  it('formats rupees with thousands separators', () => {
    expect(formatPKR(1250)).toBe('Rs 1,250')
  })
  it('formats order numbers', () => {
    expect(formatOrderNumber(7)).toBe('OX-0007')
    expect(formatOrderNumber(12345)).toBe('OX-12345')
  })
})
