import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { requireAdminPage } from '../admin-guard'
import { NewTestimonialForm, TestimonialControls } from '../admin-controls'
import { PageTitle, Panel } from '../ui'

export const metadata = { title: 'Testimonials' }

export default async function AdminTestimonials() {
  await requireAdminPage()
  const items = await db.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return (
    <>
      <PageTitle title="Testimonials" />
      <Panel className="mb-6 p-6">
        <h2 className="mb-4 font-bold">Add a testimonial</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Only publish genuine customer feedback, with the customer’s permission.
        </p>
        <NewTestimonialForm />
      </Panel>
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((t) => (
          <li key={t.id}>
            <Panel className="grid h-full gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">
                  {t.name} <span className="text-cta">{'★'.repeat(t.rating)}</span>
                </p>
                <Badge variant={t.isPublished ? 'success' : 'secondary'}>
                  {t.isPublished ? 'Published' : 'Hidden'}
                </Badge>
              </div>
              <p className="text-muted-foreground flex-1 text-sm">“{t.text}”</p>
              <TestimonialControls id={t.id} isPublished={t.isPublished} />
            </Panel>
          </li>
        ))}
      </ul>
    </>
  )
}
