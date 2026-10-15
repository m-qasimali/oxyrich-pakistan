import { expect, type Page } from '@playwright/test'

export const randomMobile = () => `03${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`

export async function addProductToOrder(page: Page, productName = '19 Litre Bottle') {
  await page.goto('/products')
  const card = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: productName }) })
  await card.getByRole('button', { name: 'Add to order' }).click()
  await expect(card.getByRole('button', { name: 'Added' })).toBeVisible()
}

export async function fillDeliveryDetails(page: Page, d: { name?: string; phone?: string }) {
  if (d.name !== undefined) await page.getByLabel('Full name').fill(d.name)
  if (d.phone !== undefined) await page.getByLabel('Mobile number').fill(d.phone)
  await page.getByLabel('Sector / area').fill('G-11/2')
  await page.getByLabel('House, street and landmark').fill('House 12, Street 4, near the park')
}

export async function placeOrderFromCheckout(page: Page) {
  await page.getByRole('button', { name: 'Place order' }).click()
  const success = page.getByTestId('order-success')
  await expect(success).toBeVisible()
  const text = (await success.textContent()) ?? ''
  const number = text.match(/OX-\d+/)?.[0]
  expect(number).toBeTruthy()
  return number!
}

export async function register(page: Page, name: string, phone: string, password: string) {
  await page.goto('/register')
  await page.getByLabel('Full name').fill(name)
  await page.getByLabel('Mobile number').fill(phone)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByTestId('account-greeting')).toContainText(name)
}

export async function login(page: Page, phone: string, password: string, next?: string) {
  await page.goto(next ? `/login?next=${next}` : '/login')
  await page.getByLabel('Mobile number').fill(phone)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
}
