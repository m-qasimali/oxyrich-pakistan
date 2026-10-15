export function AuthCard({
  title,
  body,
  children,
}: {
  title: string
  body?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-ripple -mt-16 pt-16 lg:-mt-20 lg:pt-20">
      <div className="container-page flex justify-center py-12 sm:py-20">
        <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          {body ? <p className="text-muted-foreground mt-2">{body}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  )
}
