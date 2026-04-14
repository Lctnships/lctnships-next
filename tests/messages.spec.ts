import { test, expect } from "@playwright/test"
import { HOST_STORAGE_STATE, RENTER_STORAGE_STATE } from "./fixtures/global-setup"

const SEEDED_HOST_GREETING = "Welcome! Looking forward to your session."

test.describe("Messages — unauthenticated", () => {
  test("redirected to login", async ({ page }) => {
    await page.goto("/nl/messages")
    await page.waitForURL(/\/login/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/login/)
  })
})

test.describe("Messages — renter side", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("messages page renders", async ({ page }) => {
    await page.goto("/nl/messages")
    await expect(page).toHaveURL(/\/messages/)
    // Either a conversation list or an empty-state.
    const hasConversation = page.getByText(/E2E Test Studio|Test Host/i).first()
    const emptyState = page.getByText(/Nog geen berichten/i)
    await expect(hasConversation.or(emptyState)).toBeVisible({ timeout: 15000 })
  })

  test("seeded host greeting is visible to renter", async ({ page }) => {
    await page.goto("/nl/messages")
    // Open the conversation — click the conversation row if present.
    const convoRow = page.getByText(/E2E Test Studio|Test Host/i).first()
    if (await convoRow.isVisible().catch(() => false)) {
      await convoRow.click()
    }
    await expect(page.getByText(SEEDED_HOST_GREETING).first()).toBeVisible({ timeout: 15000 })
  })

  test("renter can send a reply via the messages API", async ({ page, request }) => {
    // Grab the conversation id from the DB via the user API (or from the URL
    // after opening the conversation). We use the API route which the UI uses
    // to verify send works end-to-end with real auth cookies.
    await page.goto("/nl/messages")
    const convoRow = page.getByText(/E2E Test Studio|Test Host/i).first()
    await convoRow.click()
    await page.waitForURL(/\/messages/, { timeout: 10000 })

    // Pull conversation id from the messages API directly.
    const listResp = await request.get("/api/conversations")
    expect(listResp.ok()).toBeTruthy()
    const list = (await listResp.json()) as { conversations?: { id: string }[] }
    const conversationId = list.conversations?.[0]?.id
    expect(conversationId, "expected a seeded conversation").toBeTruthy()

    const replyContent = `Renter reply ${Date.now()}`
    const sendResp = await request.post("/api/messages", {
      data: { conversation_id: conversationId, content: replyContent },
    })
    expect(sendResp.status(), `POST /api/messages failed: ${await sendResp.text()}`).toBeLessThan(300)
  })
})

test.describe("Messages — host side", () => {
  test.use({ storageState: HOST_STORAGE_STATE })

  test("host sees the same conversation", async ({ page }) => {
    await page.goto("/nl/messages")
    await expect(page).toHaveURL(/\/messages/)
    const hasConversation = page.getByText(/E2E Test Studio|Test Renter/i).first()
    await expect(hasConversation).toBeVisible({ timeout: 15000 })
  })

  test("host sees their own seeded greeting in the thread", async ({ page }) => {
    await page.goto("/nl/messages")
    const convoRow = page.getByText(/E2E Test Studio|Test Renter/i).first()
    if (await convoRow.isVisible().catch(() => false)) {
      await convoRow.click()
    }
    await expect(page.getByText(SEEDED_HOST_GREETING).first()).toBeVisible({ timeout: 15000 })
  })
})
