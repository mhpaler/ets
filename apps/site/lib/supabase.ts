import { type SupabaseClient, createClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Type for our email subscriber
export interface EmailSubscriber {
  id?: number
  email: string
  created_at?: string
  source?: string
}