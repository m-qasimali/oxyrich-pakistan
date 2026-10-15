import 'server-only'
import { Resend } from 'resend'
import { formatOrderNumber, formatPKR } from './pricing'
import { formatPhone } from './phone'

type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string }

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM ?? 'Oxyrich Pakistan <onboarding@resend.dev>'

/** Send an email via Resend; logs to the console when RESEND_API_KEY is not configured. */
export async function sendEmail(mail: Mail): Promise<void> {
  if (!resend) {
    console.info(`[email:dev] To: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`)
    return
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
    })
    if (error) console.error('[email] Resend error:', error)
  } catch (error) {
    // Never fail an order because email delivery failed — it is already in the DB.
    console.error('[email] send failed:', error)
  }
}

export function adminRecipient(fallback: string) {
  return process.env.ADMIN_NOTIFY_EMAIL || fallback
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

function layout(title: string, rows: [string, string][], footer?: string) {
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#475569;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#0f172a">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
<h2 style="color:#2a2465;margin:0 0 16px">${esc(title)}</h2>
<table style="border-collapse:collapse;font-size:14px">${htmlRows}</table>
${footer ? `<p style="color:#475569;font-size:13px;margin-top:20px">${esc(footer)}</p>` : ''}
</div>`
  const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}${footer ? `\n\n${footer}` : ''}`
  return { html, text }
}

export type OrderEmailData = {
  number: number
  name: string
  phone: string
  sector: string
  address: string
  notes?: string | null
  items: { name: string; qty: number; unitPrice: number }[]
  subtotal: number
  depositTotal: number
  bottlesReturned: number
  total: number
  source: string
}

export function newOrderEmail(o: OrderEmailData, adminUrl: string) {
  const title = `New order ${formatOrderNumber(o.number)} — ${o.sector}`
  return {
    subject: title,
    ...layout(
      title,
      [
        ['Customer', o.name],
        ['Phone', formatPhone(o.phone)],
        ['Sector', o.sector],
        ['Address', o.address],
        [
          'Items',
          o.items.map((i) => `${i.qty} × ${i.name} @ ${formatPKR(i.unitPrice)}`).join('\n'),
        ],
        ['Empties returned', String(o.bottlesReturned)],
        ['Subtotal', formatPKR(o.subtotal)],
        ['Bottle deposit', formatPKR(o.depositTotal)],
        ['Total (COD)', formatPKR(o.total)],
        ['Notes', o.notes || '—'],
        ['Source', o.source],
      ],
      `Manage this order: ${adminUrl}`,
    ),
  }
}

export function enquiryEmail(
  e: {
    type: string
    name: string
    phone: string
    email?: string | null
    company?: string | null
    monthlyVolume?: string | null
    address?: string | null
    message: string
  },
  adminUrl: string,
) {
  const title = `New ${e.type.toLowerCase().replace(/_/g, ' ')} enquiry from ${e.name}`
  return {
    subject: title,
    replyTo: e.email ?? undefined,
    ...layout(
      title,
      [
        ['Name', e.name],
        ['Phone', formatPhone(e.phone)],
        ['Email', e.email || '—'],
        ['Company', e.company || '—'],
        ['Monthly volume', e.monthlyVolume || '—'],
        ['Address', e.address || '—'],
        ['Message', e.message],
      ],
      `View enquiries: ${adminUrl}`,
    ),
  }
}

export function passwordResetEmail(name: string, link: string) {
  return {
    subject: 'Reset your Oxyrich Pakistan password',
    ...layout(
      'Reset your password',
      [
        ['Hi', name],
        ['Reset link', link],
      ],
      'This link expires in 1 hour. If you did not request a reset, you can ignore this email.',
    ),
  }
}
