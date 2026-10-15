import { Droplet } from 'lucide-react'

export function ErrorState({
  code,
  title,
  body,
  children,
}: {
  code: string
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <section className="bg-ripple -mt-16 pt-16 lg:-mt-20 lg:pt-20">
      <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
        <div className="ripple-rings relative flex size-28 items-center justify-center">
          <Droplet className="fill-accent/20 text-accent-strong size-16" aria-hidden />
        </div>
        <p className="font-display text-primary/20 mt-6 text-6xl font-extrabold dark:text-white/20">
          {code}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="text-muted-foreground mt-4 max-w-md text-lg">{body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>
      </div>
    </section>
  )
}
