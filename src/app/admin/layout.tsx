import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { themeScript } from '@/components/providers/theme'
import { AdminNav } from './admin-nav'
import { requireAdminPage } from './admin-guard'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Oxyrich Admin' },
  robots: { index: false, follow: false },
}

/** Separate root layout: the admin UI never shares chrome with the public site. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage()
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="bg-muted/40">
        <NextIntlClientProvider>
          <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
            <AdminNav userName={user.name ?? 'Admin'} />
            <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
