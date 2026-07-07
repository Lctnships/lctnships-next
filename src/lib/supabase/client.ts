import { createBrowserClient } from '@supabase/ssr'

// Singleton instance for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

// Note: Remove the Database generic to avoid type issues
// You can regenerate types with: npx supabase gen types typescript --project-id <your-project-id>
export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return a dummy client during build if env vars are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a placeholder URL and key
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  // Create and cache the browser client.
  // Plain defaults: @supabase/ssr manages cookie storage itself so the
  // session cookie matches what createServerClient reads server-side.
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return browserClient
}

/**
 * Reset the browser client (useful for logout)
 */
export function resetClient() {
  browserClient = null
}
