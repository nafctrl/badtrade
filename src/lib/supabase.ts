import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        _supabase = createClient(supabaseUrl, supabaseAnonKey)
    }
    return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return (getSupabase() as any)[prop]
    }
})

// Supabase Types
export interface UserTokens {
    user_id: string
    red_tokens: number
    gold_tokens: number
    black_tokens: number
    created_at: string
    updated_at: string
}

export interface InventoryItem {
    id: string
    user_id: string
    item_id: string
    item_name: string
    item_type: 'red' | 'gold' | 'black'
    item_emoji: string
    duration_minutes: number | null
    status: 'Inactive' | 'Active' | 'Paused' | 'USED' | 'EXPIRED'
    purchased_at: string
    activated_at: string | null
    expires_at: string | null
    paused_remaining_ms?: number | null
}

// Dummy user ID until auth is implemented
export const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000001'
