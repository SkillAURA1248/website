/**
 * SkillAURA — Supabase Client (typed)
 * Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env.local
 * Falls back gracefully to null when env vars are empty.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ── Database types ──────────────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          auth_user_id: string
          display_name: string
          username: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          status: 'online' | 'offline' | 'away' | 'available'
          gradient_index: number
          sessions_completed: number
          rating: number
          review_count: number
          is_verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          icon: string | null
          popularity: number
        }
        Insert: Omit<Database['public']['Tables']['skills']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['skills']['Row']>
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          kind: 'teach' | 'learn'
          level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_skills']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_skills']['Row']>
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          content: string
          status: 'sent' | 'delivered' | 'read'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Row']>
      }
      threads: {
        Row: {
          id: string
          created_at: string
        }
        Insert: { id?: string }
        Update: Partial<Database['public']['Tables']['threads']['Row']>
      }
      thread_participants: {
        Row: {
          thread_id: string
          user_id: string
        }
        Insert: Database['public']['Tables']['thread_participants']['Row']
        Update: Partial<Database['public']['Tables']['thread_participants']['Row']>
      }
      swap_requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          teach_skill: string
          learn_skill: string
          status: 'pending' | 'accepted' | 'declined' | 'completed'
          message: string | null
          duration: number
          scheduled_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['swap_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['swap_requests']['Row']>
      }
    }
    Functions: {
      find_matches: {
        Args: { p_user_id: string; limit_count: number }
        Returns: Array<{
          id: string
          user_id: string
          match_score: number
          shared_teach: string[]
          shared_learn: string[]
        }>
      }
    }
  }
}

export type TypedSupabaseClient = SupabaseClient<Database>

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseReady = Boolean(url && key && url.startsWith('https://'))

// We export as SupabaseClient<any> so callers don't hit `never` inference issues
// when table names are resolved at runtime. The Database type above is still
// useful for documentation and future tighter typing.
export const supabase: SupabaseClient<any> | null = isSupabaseReady
  ? createClient<any>(url!, key!)
  : null
