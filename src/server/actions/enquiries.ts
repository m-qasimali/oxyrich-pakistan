'use server'

import { after } from 'next/server'
import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import { adminRecipient, enquiryEmail, sendEmail } from '@/lib/email'
import { enquirySchema, type EnquiryInput } from '@/lib/validation'
import { SITE_URL } from '@/config/site'
import { fieldErrorsFrom, guardPublicForm, type ActionResult } from '../action-utils'

/** Contact form and service enquiries (commercial, filtration plant, softening). */
export async function submitEnquiry(input: EnquiryInput): Promise<ActionResult> {
  const parsed = enquirySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const data = parsed.data
  const blocked = await guardPublicForm('enquiry', data)
  if (blocked === 'rate_limited') return { ok: false, error: 'form.rateLimited' }
  if (blocked) return { ok: false, error: 'order.errorBot' }

  try {
    const enquiry = await db.enquiry.create({
      data: {
        type: data.type,
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        company: data.company || null,
        monthlyVolume: data.monthlyVolume || null,
        address: data.address || null,
        message: data.message,
      },
    })
    const settings = await getSiteSettings()
    const mail = enquiryEmail(enquiry, `${SITE_URL}/admin/enquiries`)
    after(() => sendEmail({ to: adminRecipient(settings.email), ...mail }))
    return { ok: true }
  } catch (error) {
    console.error('[enquiry] failed', error)
    return { ok: false, error: 'form.error' }
  }
}
