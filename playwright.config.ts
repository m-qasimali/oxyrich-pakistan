import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3100)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

/**
 * End-to-end tests run against a production build with a real database
 * (DATABASE_URL from .env, seeded with `npm run db:seed`).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testIgnore: /admin\.spec\.ts/ },
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] }, testMatch: /admin\.spec\.ts/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: baseURL,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        env: {
          DISABLE_RATE_LIMIT: 'true',
          NEXT_PUBLIC_SITE_URL: baseURL,
          AUTH_URL: baseURL,
        },
      },
})
