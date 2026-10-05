import { createClient } from '@/utils/supabase/server';

/**
 * Server-side helper to verify user is authenticated AND holds admin role in app_metadata.
 * Throws an error or returns authorized Supabase client.
 * Supports both `const supabase = await requireAdmin()` and `const { supabase, user } = await requireAdmin()`.
 * NEVER put 'use server' in this file.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.app_metadata?.role !== 'admin') {
    console.error('[requireAdmin] Auth Check Failed:', {
      error,
      userId: user?.id,
      role: user?.app_metadata?.role,
      app_metadata: user?.app_metadata,
    });
    throw new Error(`Forbidden: ${error?.message || 'Not an admin'}`);
  }

  return Object.assign(supabase, { supabase, user });
}

