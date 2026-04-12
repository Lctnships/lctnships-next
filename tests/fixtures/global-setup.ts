import { chromium, FullConfig } from "@playwright/test"
import { resolve } from "path"
import { seed } from "./seed"
import { TEST_HOST } from "./test-users"

export const HOST_STORAGE_STATE = resolve(process.cwd(), "tests/.auth/host.json")

export default async function globalSetup(_config: FullConfig) {
  await seed()

  const baseURL = "http://localhost:3002"
  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()

  await page.goto("/nl/login")
  await page.fill("#email", TEST_HOST.email)
  await page.fill("#password", TEST_HOST.password)
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ])

  await context.storageState({ path: HOST_STORAGE_STATE })
  await browser.close()
}
