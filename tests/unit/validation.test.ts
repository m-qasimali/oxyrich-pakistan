import { describe, expect, it } from 'vitest'
import { enquirySchema, orderSchema, registerSchema } from '@/lib/validation'

describe('orderSchema', () => {
  const valid = {
    name: 'Hassam Khan',
    phone: '0336-4448494',
    sector: 'G-11',
    address: 'House 1, Street 2',
    items: [{ productId: 'p1', qty: 2 }],
    bottlesReturned: 0,
  }

  it('accepts a valid order and normalises the phone', () => {
    const r = orderSchema.parse(valid)
    expect(r.phone).toBe('03364448494')
  })

  it('rejects an empty cart and bad phone with i18n keys', () => {
    const r = orderSchema.safeParse({ ...valid, items: [], phone: '123' })
    expect(r.success).toBe(false)
    const messages = r.error!.issues.map((i) => i.message)
    expect(messages).toContain('validation.cartEmpty')
    expect(messages).toContain('validation.mobileInvalid')
  })

  it('rejects a filled honeypot', () => {
    expect(orderSchema.safeParse({ ...valid, company_website: 'spam.example' }).success).toBe(false)
  })
})

describe('enquirySchema', () => {
  it('requires a company name for commercial enquiries', () => {
    const r = enquirySchema.safeParse({
      type: 'COMMERCIAL',
      name: 'Ali',
      phone: '051-1234567',
      message: 'We need 200 bottles a month.',
    })
    expect(r.success).toBe(false)
    expect(r.error!.issues[0]!.path).toEqual(['company'])
  })

  it('treats an empty email as absent', () => {
    const r = enquirySchema.parse({
      type: 'CONTACT',
      name: 'Ali',
      phone: '03001234567',
      email: '',
      message: 'Hello there, a question.',
    })
    expect(r.email).toBeUndefined()
  })
})

describe('registerSchema', () => {
  it('requires matching passwords of 8+ characters', () => {
    const r = registerSchema.safeParse({
      name: 'Ali',
      phone: '03001234567',
      password: 'short',
      confirmPassword: 'other',
    })
    expect(r.success).toBe(false)
    const messages = r.error!.issues.map((i) => i.message)
    expect(messages).toContain('validation.passwordShort')
  })
})
