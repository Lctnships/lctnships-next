import { loadStripe } from "@stripe/stripe-js"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!publishableKey) {
  console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set")
}

export const stripePromise = publishableKey ? loadStripe(publishableKey) : null

export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise
  if (!stripe) {
    throw new Error("Stripe not initialized")
  }

  // Use Stripe's checkout redirect - access legacy method if available
  const stripeObj = stripe as unknown as Record<string, unknown>
  if (typeof stripeObj.redirectToCheckout === "function") {
    const result = await (stripeObj.redirectToCheckout as (opts: { sessionId: string }) => Promise<{ error?: { message: string } }>)({ sessionId })
    if (result.error) {
      throw result.error
    }
  } else {
    // Fallback: redirect via URL for newer Stripe.js versions
    window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
  }
}
