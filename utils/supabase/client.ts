import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a stub client during build/prerendering if env vars are missing
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ 
          data: { user: null, session: null }, 
          error: { message: "Supabase environment variables are missing. Please check your deployment settings.", name: "ConfigError", status: 400 } 
        }),
        signUp: async () => ({ 
          data: { user: null, session: null }, 
          error: { message: "Supabase environment variables are missing. Please check your deployment settings.", name: "ConfigError", status: 400 } 
        }),
      },
      from: () => ({
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
      }),
    } as any
  }

  return createBrowserClient(url, key)
}