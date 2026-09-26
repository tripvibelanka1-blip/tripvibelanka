import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey =
  process.env.NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function createClient(customCookieStore?: Awaited<ReturnType<typeof cookies>>) {
  const cookieStore = customCookieStore ?? (await cookies());

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Server-only admin client that bypasses RLS for verified backend operations.
 * NEVER expose this to client components.
 */
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Static client for use in generateStaticParams (build-time)
 * Uses anon key and no cookies.
 */
export function createStaticClient() {
  return createSupabaseClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false },
  });
}

