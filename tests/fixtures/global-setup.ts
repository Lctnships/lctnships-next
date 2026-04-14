import { chromium, FullConfig } from "@playwright/test"
import { resolve } from "path"
import { seed } from "./seed"
import { TEST_HOST, TEST_RENTER } from "./test-users"

export const HOST_STORAGE_STATE = resolve(process.cwd(), "tests/.auth/host.json")
export const RENTER_STORAGE_STATE = resolve(process.cwd(), "tests/.auth/renter.json")

async function loginAndCapture(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  baseURL: string,
  email: string,
  password: string,
  statePath: string,
) {
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()
  await page.goto("/nl/login")
  await page.fill("#email", email)
  await page.fill("#password", password)
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ])
  await context.storageState({ path: statePath })
  await context.close()
}

export default async function globalSetup(_config: FullConfig) {
  await seed()

  const baseURL = "http://localhost:3002"
  const browser = await chromium.launch()
  try {
    await loginAndCapture(browser, baseURL, TEST_HOST.email, TEST_HOST.password, HOST_STORAGE_STATE)
    await loginAndCapture(browser, baseURL, TEST_RENTER.email, TEST_RENTER.password, RENTER_STORAGE_STATE)
  } finally {
    await browser.close()
  }
}
