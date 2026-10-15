import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'center',
  as: H = 'h2',
  className,
  id,
}: {
  eyebrow?: string
  title: string
  body?: string
  align?: 'center' | 'start'
  as?: 'h1' | 'h2'
  className?: string
  id?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-start',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <H
        id={id}
        className={cn(
          'text-foreground mt-2 font-bold',
          H === 'h1' ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl',
        )}
      >
        {title}
      </H>
      {body ? <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{body}</p> : null}
    </div>
  )
}

/** Light ripple header used at the top of inner pages (extends behind the transparent header). */
export function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow?: string
  title: string
  body?: string
  children?: React.ReactNode
}) {
  return (
    <section className="bg-ripple -mt-16 pt-16 lg:-mt-20 lg:pt-20">
      <div className="container-page py-14 sm:py-20">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} body={body} />
        {children}
      </div>
    </section>
  )
}
