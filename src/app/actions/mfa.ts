"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

// Wrapper around Supabase Auth MFA. The boolean column users.two_factor_enabled
// is treated as a *mirror* of Supabase's authoritative factor state — useful
// for cheap UI checks but never for security decisions. Real auth gating
// happens via session AAL (see middleware) and Supabase's MFA verification.

export interface EnrollResult {
  factorId: string
  qrCode: string      // otpauth:// URI — render with QRCodeSVG
  secret: string      // base32 secret for manual entry fallback
}

export interface ActionResult<T = null> {
  ok: boolean
  data: T | null
  error: string | null
}

export async function enrollMfa(): Promise<ActionResult<EnrollResult>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, data: null, error: "Unauthorized" }

  // Clean up any prior unverified factors for this user (Supabase keeps them).
  const { data: factors } = await supabase.auth.mfa.listFactors()
  if (factors?.totp) {
    for (const f of factors.totp) {
      if (f.status !== "verified") {
        await supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => {})
      }
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "lctnships",
    friendlyName: `lctnships-${Date.now()}`,
  })
  if (error || !data) {
    logger.error("MFA enroll failed", error)
    return { ok: false, data: null, error: error?.message ?? "Enroll failed" }
  }
  return {
    ok: true,
    data: {
      factorId: data.id,
      qrCode: data.totp.uri,
      secret: data.totp.secret,
    },
    error: null,
  }
}

export async function verifyEnrollment(factorId: string, code: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, data: null, error: "Unauthorized" }

  const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
  if (challengeErr || !challenge) {
    logger.error("MFA challenge failed during enroll", challengeErr)
    return { ok: false, data: null, error: challengeErr?.message ?? "Challenge failed" }
  }

  const { error: verifyErr } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })
  if (verifyErr) return { ok: false, data: null, error: verifyErr.message }

  // Mirror to users.two_factor_enabled for UI display. Service-client because
  // this column is restricted by migration 011 column grants.
  const admin = await createServiceClient()
  await admin.from("users").update({ two_factor_enabled: true }).eq("id", user.id)

  return { ok: true, data: null, error: null }
}

export async function unenrollMfa(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, data: null, error: "Unauthorized" }

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const totps = factors?.totp ?? []
  for (const f of totps) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id })
    if (error) {
      logger.error("MFA unenroll failed", error, { factorId: f.id })
      return { ok: false, data: null, error: error.message }
    }
  }

  const admin = await createServiceClient()
  await admin.from("users").update({ two_factor_enabled: false }).eq("id", user.id)

  return { ok: true, data: null, error: null }
}

export async function listFactors(): Promise<ActionResult<{ totp: { id: string; status: string }[] }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, data: null, error: "Unauthorized" }

  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) return { ok: false, data: null, error: error.message }
  return {
    ok: true,
    data: { totp: (data?.totp ?? []).map((f) => ({ id: f.id, status: f.status })) },
    error: null,
  }
}

// Login-time challenge: caller passes the code, we verify against the (sole)
// active TOTP factor for this user. On success the session is upgraded to AAL2.
export async function verifyLoginChallenge(code: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, data: null, error: "Unauthorized" }

  const { data: factors, error: listErr } = await supabase.auth.mfa.listFactors()
  if (listErr) return { ok: false, data: null, error: listErr.message }
  const verified = factors?.totp?.find((f) => f.status === "verified")
  if (!verified) return { ok: false, data: null, error: "No verified TOTP factor enrolled" }

  const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: verified.id })
  if (chErr || !challenge) return { ok: false, data: null, error: chErr?.message ?? "Challenge failed" }

  const { error: verifyErr } = await supabase.auth.mfa.verify({
    factorId: verified.id,
    challengeId: challenge.id,
    code,
  })
  if (verifyErr) return { ok: false, data: null, error: verifyErr.message }

  return { ok: true, data: null, error: null }
}
