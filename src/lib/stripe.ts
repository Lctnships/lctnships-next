import { SITE_URL } from "@/lib/seo"
import Stripe from "stripe"

// Lazy initialization to prevent build-time errors
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  }
  return stripeInstance
}

// Platform commission percentage (15%)
export const PLATFORM_FEE_PERCENT = 15

interface CreateBookingPaymentParams {
  amount: number // in euros (e.g., 100 for €100)
  studioOwnerId: string // Stripe Connect account ID (acct_xxxxx)
  bookingId: string
  customerEmail: string
  studioName: string
  bookingDate: string
  hours: number
}

export async function createBookingPayment({
  amount,
  studioOwnerId,
  bookingId,
  customerEmail,
  studioName,
  bookingDate,
  hours,
}: CreateBookingPaymentParams) {
  const stripe = getStripe()

  // Convert to cents
  const amountInCents = Math.round(amount * 100)

  // Calculate platform fee (15%)
  const applicationFee = Math.round(amountInCents * (PLATFORM_FEE_PERCENT / 100))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "ideal", "sepa_debit", "bancontact"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Boeking: ${studioName}`,
            description: `${hours} uur op ${bookingDate}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: studioOwnerId,
      },
    },
    metadata: {
      type: "booking_payment",
      bookingId,
      studioOwnerId,
      platformFee: applicationFee.toString(),
      hours: hours.toString(),
    },
    success_url: `${SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/booking/cancel`,
  })

  return session
}

interface CreateCreditPurchaseParams {
  packageId: string
  packageName: string
  credits: number
  price: number // in euros
  discountPercent: number
  userId: string
  customerEmail: string
}

export async function createCreditPurchase({
  packageId,
  packageName,
  credits,
  price,
  discountPercent,
  userId,
  customerEmail,
}: CreateCreditPurchaseParams) {
  const stripe = getStripe()

  const amountInCents = Math.round(price * 100)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "ideal", "sepa_debit", "bancontact"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${packageName} - ${credits} Studio Days`,
            description: `${discountPercent}% discount - Credit package`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "credit_purchase",
      packageId,
      userId,
      credits: credits.toString(),
    },
    success_url: `${SITE_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/credits`,
  })

  return session
}

// Transfer to studio owner for credit bookings
export async function transferToStudioOwner(
  studioOwnerId: string,
  amount: number, // in euros
  bookingId: string
) {
  const stripe = getStripe()

  // Studio owner gets 85% of the average day rate
  const amountInCents = Math.round(amount * 100)

  const transfer = await stripe.transfers.create({
    amount: amountInCents,
    currency: "eur",
    destination: studioOwnerId,
    metadata: {
      bookingId,
      type: "credit_booking_payout",
    },
  })

  return transfer
}
