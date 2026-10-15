/**
 * Seed: products, testimonials, site settings and the first admin account.
 * Safe to re-run — existing rows are not overwritten (admin edits are preserved).
 *
 *   npm run db:seed
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { DEFAULT_SETTINGS } from '../src/config/site'
import { CATALOG_PRODUCTS, CATALOG_TESTIMONIALS } from '../src/content/catalog'
import { normalizePhone } from '../src/lib/phone'

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  for (const p of CATALOG_PRODUCTS) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, composition: p.composition },
    })
  }
  console.log(`✓ ${CATALOG_PRODUCTS.length} products`)

  if ((await db.testimonial.count()) === 0) {
    await db.testimonial.createMany({
      data: CATALOG_TESTIMONIALS.map((t, i) => ({ ...t, sortOrder: i, isPublished: true })),
    })
    console.log(`✓ ${CATALOG_TESTIMONIALS.length} testimonials`)
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } })
  }
  console.log('✓ site settings')

  const phone = process.env.SEED_ADMIN_PHONE
  const password = process.env.SEED_ADMIN_PASSWORD
  if (phone && password) {
    const normalized = normalizePhone(phone)
    const existing = await db.user.findUnique({ where: { phone: normalized } })
    if (!existing) {
      await db.user.create({
        data: {
          name: process.env.SEED_ADMIN_NAME || 'Oxyrich Admin',
          phone: normalized,
          role: 'ADMIN',
          passwordHash: await bcrypt.hash(password, 12),
        },
      })
      console.log(`✓ admin user ${normalized} — change the password after first login`)
    } else if (existing.role !== 'ADMIN') {
      await db.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } })
      console.log(`✓ promoted ${normalized} to admin`)
    }
  } else {
    console.log('ℹ SEED_ADMIN_PHONE / SEED_ADMIN_PASSWORD not set — no admin created')
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
