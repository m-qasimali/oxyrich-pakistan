import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Hero } from '@/components/sections/hero'
import { StatsBand } from '@/components/sections/stats-band'
import { Features } from '@/components/sections/features'
import { ServicesSection } from '@/components/sections/services'
import { TestimonialsCarousel } from '@/components/sections/testimonials'
import { DeliveryChecker } from '@/components/sections/delivery-checker'
import { FaqList } from '@/components/sections/faq'
import { CtaBand } from '@/components/sections/cta-band'
import { SectionHeading } from '@/components/sections/section-heading'
import { ProductCard } from '@/components/products/product-card'
import { QuickOrderForm } from '@/components/forms/quick-order-form'
import { Reveal } from '@/components/motion'
import { getProducts, getTestimonials } from '@/lib/products'
import { getSiteSettings } from '@/lib/settings'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  return pageMetadata(locale, '/', 'home')
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const [products, testimonials, settings] = await Promise.all([
    getProducts(),
    getTestimonials(),
    getSiteSettings(),
  ])
  const available = products.filter((p) => p.isAvailable)

  return (
    <>
      <Hero />
      <StatsBand />

      <section className="section" aria-labelledby="products-title">
        <div className="container-page">
          <SectionHeading
            id="products-title"
            eyebrow={t('home.productsEyebrow')}
            title={t('home.productsTitle')}
            body={t('home.productsBody')}
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.08}>
                <ProductCard product={p} pricesConfirmed={settings.pricesConfirmed} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-ripple" aria-labelledby="quick-order-title">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <SectionHeading
              id="quick-order-title"
              align="start"
              eyebrow={t('home.quickOrderEyebrow')}
              title={t('home.quickOrderTitle')}
              body={t('home.quickOrderBody')}
            />
            <div className="mt-8">
              <QuickOrderForm
                products={available.map((p) => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  packSize: p.packSize,
                }))}
              />
            </div>
          </div>
          <div className="lg:pt-8">
            <SectionHeading
              align="start"
              eyebrow={t('home.deliveryEyebrow')}
              title={t('home.deliveryTitle')}
              body={t('home.deliveryBody')}
            />
            <div className="mt-8">
              <DeliveryChecker />
            </div>
          </div>
        </div>
      </section>

      <Features />
      <ServicesSection />

      {testimonials.length > 0 ? (
        <section className="section" aria-labelledby="testimonials-title">
          <div className="container-page">
            <SectionHeading
              id="testimonials-title"
              eyebrow={t('home.testimonialsEyebrow')}
              title={t('home.testimonialsTitle')}
            />
            <div className="mt-12">
              <TestimonialsCarousel items={testimonials} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="section bg-muted/60" aria-labelledby="faq-title">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              id="faq-title"
              align="start"
              eyebrow={t('home.faqEyebrow')}
              title={t('home.faqTitle')}
              body={t('faq.body')}
            />
            <Link
              href="/faq"
              className="text-accent-strong mt-6 inline-flex items-center gap-1.5 font-semibold hover:underline"
            >
              {t('common.viewAll')}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
          <FaqList keys={['areas', 'deposit', 'timings', 'payment']} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
