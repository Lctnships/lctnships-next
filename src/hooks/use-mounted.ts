import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

/**
 * Returns `true` on the client after hydration, `false` during SSR.
 * Uses useSyncExternalStore to avoid setState-in-useEffect and
 * hydration mismatches.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}
