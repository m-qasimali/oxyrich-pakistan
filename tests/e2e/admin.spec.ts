import { expect, test } from '@playwright/test'
import { login, randomMobile } from './helpers'

const ADMIN_PHONE = process.env.E2E_ADMIN_PHONE ?? process.env.SEED_ADMIN_PHONE ?? ''
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? ''

test.skip(
  !ADMIN_PHONE || !ADMIN_PASSWORD,
  'Set SEED_ADMIN_PHONE / SEED_ADMIN_PASSWORD (and run db:seed)',
)

test('admin moves a quick order from pending to delivered', async ({ page }) => {
  // A visitor places a quick order on the home page.
  await page.goto('/')
  const quick = page.getByRole('form', { name: 'Order in 30 seconds' })
  await quick.getByLabel('Sector / area').fill('I-9/3')
  await quick.getByLabel('Mobile number').fill(randomMobile())
  await quick.getByRole('button', { name: 'Place order' }).click()
  const success = page.getByTestId('order-success')
  await expect(success).toBeVisible()
  const orderNumber = ((await success.textContent()) ?? '').match(/OX-(\d+)/)![1]!

  // The public site never exposes the admin.
  await page.context().clearCookies()
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login\?next=\/admin/)

  await login(page, ADMIN_PHONE, ADMIN_PASSWORD, '/admin')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.goto(`/admin/orders?q=OX-${orderNumber}`)
  const row = page.getByTestId(`order-row-${Number(orderNumber)}`)
  await expect(row).toContainText('Pending')

  for (const [button, label] of [
    ['status-CONFIRMED', 'Confirmed'],
    ['status-OUT_FOR_DELIVERY', 'Out for delivery'],
    ['status-DELIVERED', 'Delivered'],
  ] as const) {
    await row.getByTestId(button).click()
    await expect(row).toContainText(label)
  }
  // Delivered is final.
  await expect(row.getByRole('button')).toHaveCount(0)
})

test('non-admin customers cannot open the admin area', async ({ page }) => {
  await page.goto('/register')
  const phone = randomMobile()
  await page.getByLabel('Full name').fill('Not Admin')
  await page.getByLabel('Mobile number').fill(phone)
  await page.getByLabel('Password', { exact: true }).fill('not-admin-123')
  await page.getByLabel('Confirm password').fill('not-admin-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/account$/)
})
