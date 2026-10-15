/**
 * Seed content for the database (prisma/seed.ts) and read-only fallback when the
 * database is unreachable. After seeding, the database is the source of truth and
 * products/testimonials are edited from /admin.
 */

export type CompositionRow = { name: string; value: string; unit: string }

export type CatalogProduct = {
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
  sortOrder: number
}

/**
 * Mineral composition — values are intentionally blank until the client supplies
 * a lab report. TODO: client to provide lab analysis.
 */
const PENDING_COMPOSITION: CompositionRow[] = [
  { name: 'Total dissolved solids (TDS)', value: '—', unit: 'mg/L' },
  { name: 'pH', value: '—', unit: '' },
  { name: 'Calcium (Ca)', value: '—', unit: 'mg/L' },
  { name: 'Magnesium (Mg)', value: '—', unit: 'mg/L' },
  { name: 'Sodium (Na)', value: '—', unit: 'mg/L' },
  { name: 'Potassium (K)', value: '—', unit: 'mg/L' },
  { name: 'Bicarbonate (HCO₃)', value: '—', unit: 'mg/L' },
  { name: 'Dissolved oxygen', value: '—', unit: 'mg/L' },
]

// TODO: client to confirm — price, packSize and depositAmount are PLACEHOLDERS.
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    slug: '19-litre-bottle',
    name: '19 Litre Bottle',
    category: 'Mineral Water',
    sizeLitres: 19,
    packSize: 1,
    price: 250, // TODO: client to confirm
    depositAmount: 1000, // TODO: client to confirm
    isReturnable: true,
    images: ['/images/products/19-litre.jpg'],
    summary:
      'Returnable dispenser bottle for homes and offices. Exchange your empty on every refill.',
    description:
      'Our 19 litre dispenser bottle is filled with purified water that has passed through our 12-step filtration process and is enriched with essential minerals and oxygen. It fits standard water dispensers and is delivered free to your door. Bottles are returnable: pay a refundable deposit with your first bottle, then simply hand back an empty each time we deliver a full one.',
    composition: PENDING_COMPOSITION,
    isAvailable: true,
    sortOrder: 1,
  },
  {
    slug: '1-5-litre-bottles',
    name: '1.5 Litre Bottles',
    category: 'Mineral Water',
    sizeLitres: 1.5,
    packSize: 6, // TODO: client to confirm carton size
    price: 480, // TODO: client to confirm (per carton)
    depositAmount: 0,
    isReturnable: false,
    images: ['/images/products/1-5-litre.svg'],
    summary: 'Family-size bottles, sold by the carton. Ideal for the dining table, car and travel.',
    description:
      'Purified, mineral- and oxygen-enriched drinking water in convenient 1.5 litre bottles. Sold by the carton and delivered free across our service areas — a practical choice for homes, events and offices.',
    composition: PENDING_COMPOSITION,
    isAvailable: true,
    sortOrder: 2,
  },
  {
    slug: '1-litre-bottles',
    name: '1 Litre Bottles',
    category: 'Mineral Water',
    sizeLitres: 1,
    packSize: 12, // TODO: client to confirm carton size
    price: 720, // TODO: client to confirm (per carton)
    depositAmount: 0,
    isReturnable: false,
    images: ['/images/products/1-litre.svg'],
    summary: 'Grab-and-go bottles, sold by the carton. Great for meetings, gyms and lunch boxes.',
    description:
      'The same purified, mineral- and oxygen-enriched water in a handy 1 litre bottle. Sold by the carton and delivered free — perfect for offices, meetings, schools and on-the-go hydration.',
    composition: PENDING_COMPOSITION,
    isAvailable: true,
    sortOrder: 3,
  },
]

export const CATALOG_TESTIMONIALS = [
  {
    name: 'Hassam Khan',
    text: 'Very good service. The staff are cooperative and reliable, and I am completely satisfied with the products.',
    rating: 5,
  },
  {
    name: 'Umer Razzaq',
    text: 'I love the healthy taste and quality. I would definitely recommend it to anyone who has had gastric problems from unhealthy water.',
    rating: 5,
  },
  {
    name: 'Tufail Khan',
    text: 'Good, fresh taste that meets all quality standards.',
    rating: 5,
  },
  {
    name: 'Zeeshan Ahmad',
    text: 'The best water in Islamabad.',
    rating: 5,
  },
]
