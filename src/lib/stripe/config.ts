// Deprecated module — kept only as a backward-compat shim for existing API
// routes that import `{ stripe }` from here. New code should import
// `getStripe()` from "@/lib/stripe" directly. This file now re-exports a
// single Stripe instance sourced from the same lazy singleton in
// src/lib/stripe.ts so we never double-initialize the SDK.
//
// L4 from the 2026-04-11 audit closeout.
import { getStripe } from "@/lib/stripe"

export const stripe = (() => {
  try {
    return getStripe()
  } catch {
    return null
  }
})()
