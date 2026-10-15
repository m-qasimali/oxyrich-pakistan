/**
 * Zod schemas shared by client forms (React Hook Form) and server actions.
 * Error messages are i18n keys under `validation.*` in messages/<locale>.json.
 */
import { z } from 'zod'
import { isPakistaniMobile, isPakistaniPhone, normalizePhone } from './phone'

const name = z.string().trim().min(2, 'validation.nameRequired').max(80, 'validation.tooLong')

export const mobile = z
  .string()
  .trim()
  .refine(isPakistaniMobile, 'validation.mobileInvalid')
  .transform(normalizePhone)

const anyPhone = z
  .string()
  .trim()
  .refine(isPakistaniPhone, 'validation.phoneInvalid')
  .transform(normalizePhone)

const optionalEmail = z
  .union([z.literal(''), z.email('validation.emailInvalid').max(120)])
  .optional()
  .transform((v) => (v ? v.toLowerCase() : undefined))

const sector = z.string().trim().min(2, 'validation.sectorRequired').max(60, 'validation.tooLong')
const longText = (max: number) => z.string().trim().max(max, 'validation.tooLong')

/** Bot protection fields present on every public form. */
const botFields = {
  /** Honeypot — must stay empty. Rendered off-screen and hidden from assistive tech. */
  company_website: z.string().max(0).optional().or(z.literal('')),
  turnstileToken: z.string().optional(),
}

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().min(1, 'validation.qtyMin').max(200, 'validation.qtyMax'),
})

export const orderSchema = z.object({
  name,
  phone: mobile,
  sector,
  address: z.string().trim().min(5, 'validation.addressRequired').max(300, 'validation.tooLong'),
  notes: longText(500).optional(),
  items: z.array(orderItemSchema).min(1, 'validation.cartEmpty').max(20),
  bottlesReturned: z.coerce.number().int().min(0).max(200).default(0),
  ...botFields,
})
export type OrderInput = z.input<typeof orderSchema>

export const quickOrderSchema = z.object({
  productId: z.string().min(1, 'validation.productRequired'),
  qty: z.coerce.number().int().min(1, 'validation.qtyMin').max(200, 'validation.qtyMax'),
  sector,
  phone: mobile,
  name: z.union([z.literal(''), name]).optional(),
  ...botFields,
})
export type QuickOrderInput = z.input<typeof quickOrderSchema>

export const enquiryTypes = ['CONTACT', 'COMMERCIAL', 'FILTRATION_PLANT', 'SOFTENING'] as const

export const enquirySchema = z
  .object({
    type: z.enum(enquiryTypes),
    name,
    phone: anyPhone,
    email: optionalEmail,
    company: longText(120).optional(),
    monthlyVolume: longText(120).optional(),
    address: longText(300).optional(),
    message: z.string().trim().min(10, 'validation.messageShort').max(2000, 'validation.tooLong'),
    ...botFields,
  })
  .superRefine((v, ctx) => {
    if (v.type === 'COMMERCIAL' && !v.company?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['company'], message: 'validation.companyRequired' })
    }
  })
export type EnquiryInput = z.input<typeof enquirySchema>

const password = z.string().min(8, 'validation.passwordShort').max(128, 'validation.tooLong')

export const loginSchema = z.object({
  phone: mobile,
  password: z.string().min(1, 'validation.passwordRequired'),
  remember: z.boolean().optional(),
})
export type LoginInput = z.input<typeof loginSchema>

export const registerSchema = z
  .object({
    name,
    phone: mobile,
    email: optionalEmail,
    password,
    confirmPassword: z.string(),
    ...botFields,
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  })
export type RegisterInput = z.input<typeof registerSchema>

export const forgotPasswordSchema = z.object({ phone: mobile, ...botFields })
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({ token: z.string().min(20), password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  })
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.passwordRequired'),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  })
export type ChangePasswordInput = z.input<typeof changePasswordSchema>

export const addressSchema = z.object({
  label: longText(30).optional(),
  sector,
  street: z.string().trim().min(1, 'validation.required').max(120, 'validation.tooLong'),
  house: z.string().trim().min(1, 'validation.required').max(60, 'validation.tooLong'),
  notes: longText(200).optional(),
  isDefault: z.boolean().optional(),
})
export type AddressInput = z.input<typeof addressSchema>

export const subscriptionSchema = z.object({
  productId: z.string().min(1, 'validation.productRequired'),
  qty: z.coerce.number().int().min(1, 'validation.qtyMin').max(50, 'validation.qtyMax'),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY']),
  startDate: z.iso.date('validation.dateInvalid'),
  sector,
  address: z.string().trim().min(5, 'validation.addressRequired').max(300, 'validation.tooLong'),
  notes: longText(300).optional(),
})
export type SubscriptionInput = z.input<typeof subscriptionSchema>
