import { describe, expect, it } from 'vitest'
import {
  formatPhone,
  isPakistaniMobile,
  isPakistaniPhone,
  normalizePhone,
  toWhatsAppNumber,
} from '@/lib/phone'
import { DEFAULT_SETTINGS } from '@/config/site'
import { whatsappLink } from '@/lib/utils'

describe('phone helpers', () => {
  it.each([
    ['0336-4448494', '03364448494'],
    ['+92 336 4448494', '03364448494'],
    ['923364448494', '03364448494'],
    ['0092 336 4448494', '03364448494'],
    ['3364448494', '03364448494'],
  ])('normalises %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it('validates mobiles and landlines', () => {
    expect(isPakistaniMobile('0336-4448494')).toBe(true)
    expect(isPakistaniMobile('051-1234567')).toBe(false)
    expect(isPakistaniPhone('051-1234567')).toBe(true)
    expect(isPakistaniMobile('12345')).toBe(false)
  })

  it('formats and converts for WhatsApp', () => {
    expect(formatPhone('03364448494')).toBe('0336-4448494')
    expect(toWhatsAppNumber('0336-4448494')).toBe('923364448494')
  })
})

describe('WhatsApp link (old site bug: wa.me/+9203364448494)', () => {
  it('uses the correct international number without + or extra 0', () => {
    expect(whatsappLink(DEFAULT_SETTINGS.whatsappNumber)).toBe('https://wa.me/923364448494')
  })
  it('url-encodes the pre-filled message', () => {
    expect(whatsappLink('923364448494', "Hi Oxyrich, I'd like to order water.")).toBe(
      "https://wa.me/923364448494?text=Hi%20Oxyrich%2C%20I'd%20like%20to%20order%20water.",
    )
  })
})
