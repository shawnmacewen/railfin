import type { Session, User } from '@supabase/supabase-js';

/**
 * Minimal server-side auth/session shape used by protected internal operations.
 *
 * This is intentionally integration-focused:
 * - no secrets are embedded
 * - current implementation is placeholder-safe for MVP wiring
 * - consumers can switch to a real Supabase server client without changing call sites
 */
export type CurrentAuthContext = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
};

/**
 * getCurrentAuthContext()
 *
 * Usage from internal endpoints (example):
 * const auth = await getCurrentAuthContext();
 * if (!auth.isAuthenticated) return new Response('Unauthorized', { status: 401 });
 */
export async function getCurrentAuthContext(): Promise<CurrentAuthContext> {
  // MVP placeholder wiring:
  // Replace this with real server client retrieval, e.g. supabase.auth.getSession()
  // once env + cookie integration is available in this workspace.
  const session: Session | null = null;
  const user: User | null = null;

  return {
    session,
    user,
    isAuthenticated: false,
  };
}
