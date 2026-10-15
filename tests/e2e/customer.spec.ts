import { expect, test } from '@playwright/test'
import {
  addProductToOrder,
  fillDeliveryDetails,
  login,
  placeOrderFromCheckout,
  randomMobile,
  register,
} from './helpers'

test('guest places an order with bottle deposit and gets a WhatsApp summary', async ({ page }) => {
  await addProductToOrder(page, '19 Litre Bottle')
  await page.goto('/order')

  // First-time 19 L order: deposit applies; exchanging an empty removes it.
  const deposit = page.getByTestId('deposit-total')
  await expect(deposit).not.toHaveText('Rs 0')
  await page.getByLabel(/Empty Oxyrich 19 L bottles/).fill('1')
  await expect(deposit).toHaveText('Rs 0')
  await page.getByLabel(/Empty Oxyrich 19 L bottles/).fill('0')

  await fillDeliveryDetails(page, { name: 'E2E Guest', phone: randomMobile() })
  const number = await placeOrderFromCheckout(page)
  expect(number).toMatch(/^OX-\d+$/)

  const wa = page.getByRole('link', { name: 'Also send on WhatsApp' })
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/923364448494\?text=/)
  // Cart is emptied after a successful order.
  await page.goto('/order')
  await expect(page.getByText('Your order is empty.')).toBeVisible()
})

test('customer registers with phone, logs out and logs back in', async ({ page }) => {
  const phone = randomMobile()
  const password = 'water-is-life-1'
  await register(page, 'E2E Customer', phone, password)

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/$/)

  // Wrong password is rejected.
  await login(page, phone, 'wrong-password')
  await expect(page.getByText('Incorrect mobile number or password.')).toBeVisible()

  // Phone accepted in international format too.
  await login(page, `+92 ${phone.slice(1, 4)} ${phone.slice(4)}`, password)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByTestId('account-greeting')).toContainText('E2E Customer')
})

test('signed-in customer reorders in one tap from their account', async ({ page }) => {
  const phone = randomMobile()
  await register(page, 'E2E Reorder', phone, 'reorder-pass-123')

  await addProductToOrder(page, '1.5 Litre Bottles')
  await page.goto('/order')
  // Name and phone are prefilled from the account.
  await expect(page.getByLabel('Mobile number')).toHaveValue(phone)
  await fillDeliveryDetails(page, {})
  await placeOrderFromCheckout(page)

  await page.goto('/account')
  const history = page.getByTestId('order-history')
  await expect(history.getByRole('listitem')).toHaveCount(1)
  await history.getByRole('button', { name: 'Reorder' }).click()
  await expect(page.getByText(/Order OX-\d+ placed/)).toBeVisible()
  await page.reload()
  await expect(page.getByTestId('order-history').getByRole('listitem')).toHaveCount(2)
})

test('contact form submits an enquiry', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel('Full name').fill('E2E Contact')
  await page.getByLabel('Phone number').fill('051-1234567')
  await page.getByLabel('Message').fill('Do you deliver to F-10 on Sundays?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByTestId('enquiry-success')).toBeVisible()
})

test('contact form shows validation errors', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText('Please enter your name.')).toBeVisible()
  await expect(page.getByText(/Enter a valid phone number/)).toBeVisible()
})

test('Urdu site renders right-to-left', async ({ page }) => {
  await page.goto('/ur')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('صاف')
})

test('customer changes their password from the account page', async ({ page }) => {
  const phone = randomMobile()
  await register(page, 'E2E Password', phone, 'first-password-1')
  await page.getByRole('button', { name: 'Change password' }).click()
  await page.getByLabel('Current password').fill('first-password-1')
  await page.getByLabel('New password').fill('second-password-2')
  await page.getByLabel('Confirm password').fill('second-password-2')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Your password has been changed.')).toBeVisible()

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/$/)
  await login(page, phone, 'second-password-2')
  await expect(page).toHaveURL(/\/account$/)
})
