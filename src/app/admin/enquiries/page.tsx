import { db } from '@/lib/db'
import { formatPhone } from '@/lib/phone'
import { Badge } from '@/components/ui/badge'
import { requireAdminPage } from '../admin-guard'
import { EnquiryStatusSelect } from '../admin-controls'
import { fmtDate, PageTitle, Table } from '../ui'

export const metadata = { title: 'Enquiries' }

const TYPE_LABELS = {
  CONTACT: 'Contact',
  COMMERCIAL: 'Commercial',
  FILTRATION_PLANT: 'Filtration plant',
  SOFTENING: 'Softening',
} as const

export default async function AdminEnquiries() {
  await requireAdminPage()
  const enquiries = await db.enquiry.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  })
  return (
    <>
      <PageTitle title="Enquiries" />
      <Table>
        <thead>
          <tr>
            <th>From</th>
            <th>Type</th>
            <th>Message</th>
            <th>Received</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-muted-foreground py-10 text-center">
                No enquiries yet.
              </td>
            </tr>
          ) : null}
          {enquiries.map((e) => (
            <tr key={e.id}>
              <td>
                {e.name}
                <div className="text-xs">
                  <a href={`tel:${e.phone}`} className="text-accent-strong hover:underline">
                    {formatPhone(e.phone)}
                  </a>
                </div>
                {e.email ? (
                  <div className="text-xs">
                    <a href={`mailto:${e.email}`} className="text-accent-strong hover:underline">
                      {e.email}
                    </a>
                  </div>
                ) : null}
              </td>
              <td>
                <Badge variant="secondary">{TYPE_LABELS[e.type]}</Badge>
                {e.company ? <div className="mt-1 text-xs">{e.company}</div> : null}
                {e.monthlyVolume ? (
                  <div className="text-muted-foreground text-xs">{e.monthlyVolume}</div>
                ) : null}
              </td>
              <td className="max-w-md whitespace-pre-line">
                {e.message}
                {e.address ? (
                  <div className="text-muted-foreground mt-1 text-xs">📍 {e.address}</div>
                ) : null}
              </td>
              <td className="text-muted-foreground">{fmtDate(e.createdAt)}</td>
              <td>
                <EnquiryStatusSelect id={e.id} status={e.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
