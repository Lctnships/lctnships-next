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

  // Use Stripe's checkout redirect - cast to access legacy method if available
  const stripeAny = stripe as any
  if (typeof stripeAny.redirectToCheckout === "function") {
    const { error } = await stripeAny.redirectToCheckout({ sessionId })
    if (error) {
      throw error
    }
  } else {
    // Fallback: redirect via URL for newer Stripe.js versions
    window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
  }
}
