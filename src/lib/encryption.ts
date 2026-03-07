import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from "crypto"

// Derive a unique salt from the key material itself (deterministic but unique per deployment)
function deriveSalt(keyMaterial: string): string {
  return createHash("sha256").update(`lctnships-salt:${keyMaterial}`).digest("hex").slice(0, 32)
}

// Get encryption key from environment variable
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    // Fallback to deriving a key from another secret — never use a hardcoded default
    const fallbackSecret = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!fallbackSecret) {
      throw new Error(
        "ENCRYPTION_KEY is not set and no fallback secret is available. " +
        "Set ENCRYPTION_KEY environment variable for encryption support."
      )
    }
    console.warn(
      "WARNING: ENCRYPTION_KEY not set. Deriving key from NEXTAUTH_SECRET. " +
      "Set ENCRYPTION_KEY in production for better security."
    )
    const salt = deriveSalt(fallbackSecret)
    return scryptSync(fallbackSecret, salt, 32)
  }
  // Key should be 32 bytes (256 bits) for AES-256
  if (key.length === 64) {
    // Hex encoded key
    return Buffer.from(key, "hex")
  }
  // Derive a proper key from the provided string using a unique salt
  const salt = deriveSalt(key)
  return scryptSync(key, salt, 32)
}

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16

/**
 * Encrypt a string value
 * @param plaintext - The string to encrypt
 * @returns Base64 encoded encrypted string (iv:authTag:ciphertext)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext

  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")

  const authTag = cipher.getAuthTag()

  // Combine IV, auth tag, and ciphertext
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
}

/**
 * Decrypt an encrypted string
 * @param encryptedData - Base64 encoded encrypted string (iv:authTag:ciphertext)
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(":")) {
    // Return as-is if not encrypted (for backwards compatibility)
    return encryptedData
  }

  try {
    const key = getEncryptionKey()
    const parts = encryptedData.split(":")

    if (parts.length !== 3) {
      // Not in expected format, return as-is
      return encryptedData
    }

    const [ivBase64, authTagBase64, ciphertext] = parts
    const iv = Buffer.from(ivBase64, "base64")
    const authTag = Buffer.from(authTagBase64, "base64")

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, "base64", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption failed:", error)
    // Return empty string on decryption failure for security
    return ""
  }
}

/**
 * Check if a string appears to be encrypted
 * @param value - The string to check
 * @returns true if the string appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false
  const parts = value.split(":")
  return parts.length === 3 && parts.every(p => p.length > 0)
}

/**
 * Encrypt sensitive studio fields
 * Use this when saving studio data
 */
export function encryptStudioSecrets(data: {
  entry_code?: string | null
  wifi_password?: string | null
  access_instructions?: string | null
}): typeof data {
  return {
    ...data,
    entry_code: data.entry_code ? encrypt(data.entry_code) : data.entry_code,
    wifi_password: data.wifi_password ? encrypt(data.wifi_password) : data.wifi_password,
    access_instructions: data.access_instructions ? encrypt(data.access_instructions) : data.access_instructions,
  }
}

/**
 * Decrypt sensitive studio fields
 * Use this when reading studio data for authorized users
 */
export function decryptStudioSecrets(data: {
  entry_code?: string | null
  wifi_password?: string | null
  access_instructions?: string | null
}): typeof data {
  return {
    ...data,
    entry_code: data.entry_code ? decrypt(data.entry_code) : data.entry_code,
    wifi_password: data.wifi_password ? decrypt(data.wifi_password) : data.wifi_password,
    access_instructions: data.access_instructions ? decrypt(data.access_instructions) : data.access_instructions,
  }
}
