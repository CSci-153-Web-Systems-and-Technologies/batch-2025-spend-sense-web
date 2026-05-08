import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing (for example during static builds or in preview environments),
  // return a lightweight mock client that safely returns unauthenticated responses
  // to avoid build-time crashes. Runtime routes and authenticated pages should still
  // set the proper environment variables in production.
  if (!url || !key) {
    // Minimal stub that implements the parts of the API used during prerendering.
    const stub = {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null }
        },
        async signOut() {
          return { error: null }
        },
      },
      from() {
        // Return chainable calls that resolve to empty results.
        const chain = () => ({ select: async () => ({ data: [], error: null }), insert: async () => ({ data: null, error: null }), upsert: async () => ({ data: null, error: null }), delete: async () => ({ data: null, error: null }) })
        return chain()
      },
    }

    return stub as any
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}