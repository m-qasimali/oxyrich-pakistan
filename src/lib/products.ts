import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { CATALOG_PRODUCTS, type CompositionRow } from '@/content/catalog'
import { db } from './db'

export const PRODUCTS_TAG = 'products'
export const TESTIMONIALS_TAG = 'testimonials'

export type ProductView = {
  id: string
  slug: string
  name: string
  category: string
  sizeLitres: number
  packSize: number
  price: number
  depositAmount: number
  isReturnable: boolean
  images: string[]
  summary: string
  description: string
  composition: CompositionRow[]
  isAvailable: boolean
}

const fallbackProducts: ProductView[] = CATALOG_PRODUCTS.map((p) => ({ ...p, id: p.slug }))

const loadProducts = unstable_cache(
  async (): Promise<ProductView[]> => {
    try {
      const rows = await db.product.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
      return rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        sizeLitres: p.sizeLitres,
        packSize: p.packSize,
        price: p.price,
        depositAmount: p.depositAmount,
        isReturnable: p.isReturnable,
        images: p.images,
        summary: p.summary,
        description: p.description,
        composition: Array.isArray(p.composition) ? (p.composition as CompositionRow[]) : [],
        isAvailable: p.isAvailable,
      }))
    } catch (error) {
      console.error('[products] database unavailable, using catalog fallback:', error)
      return fallbackProducts
    }
  },
  ['products'],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
)

export const getProducts = cache(loadProducts)

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts()
  return products.find((p) => p.slug === slug) ?? null
})

const loadTestimonials = unstable_cache(
  async () => {
    try {
      return await db.testimonial.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, name: true, text: true, rating: true },
      })
    } catch (error) {
      console.error('[testimonials] database unavailable:', error)
      return []
    }
  },
  ['testimonials'],
  { tags: [TESTIMONIALS_TAG], revalidate: 3600 },
)

export const getTestimonials = cache(loadTestimonials)
