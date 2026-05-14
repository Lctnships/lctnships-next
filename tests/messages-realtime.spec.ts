import { test, expect } from "@playwright/test"
import { HOST_STORAGE_STATE, RENTER_STORAGE_STATE } from "./fixtures/global-setup"

/**
 * Realtime messages: a renter sends a message while a host has the messages
 * page open in another browser context. Within ~5 seconds the host context
 * should see the new message in the active conversation thread WITHOUT
 * reloading.
 *
 * This validates the realtime subscription fix from PR #45 (Supabase channel
 * for the conversation receives INSERT events).
 */

test.describe("Messages realtime", () => {
  test("host sees a renter's new message within 5s without reload", async ({ browser }) => {
    const hostCtx = await browser.newContext({
      storageState: HOST_STORAGE_STATE,
      baseURL: "http://localhost:3002",
    })
    const renterCtx = await browser.newContext({
      storageState: RENTER_STORAGE_STATE,
      baseURL: "http://localhost:3002",
    })

    try {
      const hostPage = await hostCtx.newPage()
      const renterPage = await renterCtx.newPage()

      // Both navigate to their messages page and open the seeded conversation.
      await Promise.all([
        hostPage.goto("/nl/messages"),
        renterPage.goto("/nl/messages"),
      ])

      // Open the conversation in both
      const openConvo = async (page: typeof hostPage) => {
        const row = page.getByText(/E2E Test Studio|Test Renter|Test Host/i).first()
        if (await row.isVisible().catch(() => false)) {
          await row.click()
        }
      }
      await openConvo(hostPage)
      await openConvo(renterPage)

      // Confirm host page has fully mounted the thread
      await hostPage.waitForLoadState("domcontentloaded")
      await renterPage.waitForLoadState("domcontentloaded")

      // Renter sends a message via the API directly (UI path is covered in
      // messages.spec.ts; here we focus on whether the host realtime channel
      // delivers it).
      const listResp = await renterPage.request.get("/api/conversations")
      expect(listResp.ok()).toBeTruthy()
      const list = (await listResp.json()) as { conversations?: { id: string }[] }
      const conversationId = list.conversations?.[0]?.id
      expect(conversationId, "expected a seeded conversation").toBeTruthy()

      const marker = `realtime-${Date.now()}`
      const sendResp = await renterPage.request.post("/api/messages", {
        data: { conversation_id: conversationId, content: marker },
      })
      expect(sendResp.status()).toBeLessThan(300)

      // Now: without reloading, the host's open thread should display the
      // marker within 5 seconds.
      await expect(hostPage.getByText(marker)).toBeVisible({ timeout: 5000 })
    } finally {
      await hostCtx.close()
      await renterCtx.close()
    }
  })

  test("renter's own outgoing message appears in their own thread immediately", async ({ browser }) => {
    const renterCtx = await browser.newContext({
      storageState: RENTER_STORAGE_STATE,
      baseURL: "http://localhost:3002",
    })
    try {
      const page = await renterCtx.newPage()
      await page.goto("/nl/messages")
      const row = page.getByText(/E2E Test Studio|Test Host/i).first()
      if (await row.isVisible().catch(() => false)) {
        await row.click()
      }

      const listResp = await page.request.get("/api/conversations")
      const list = (await listResp.json()) as { conversations?: { id: string }[] }
      const conversationId = list.conversations?.[0]?.id
      expect(conversationId).toBeTruthy()

      const marker = `own-msg-${Date.now()}`
      const sendResp = await page.request.post("/api/messages", {
        data: { conversation_id: conversationId, content: marker },
      })
      expect(sendResp.status()).toBeLessThan(300)

      // Renter's own thread should reflect the message via realtime
      // (or via the optimistic UI append, depending on implementation).
      await expect(page.getByText(marker)).toBeVisible({ timeout: 5000 })
    } finally {
      await renterCtx.close()
    }
  })
})
