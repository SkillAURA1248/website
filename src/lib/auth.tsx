/**
 * SkillSwap — Auth (no Supabase Auth)
 * Users are stored in public.users table.
 * Session is a plain user ID in localStorage.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { UserProfile, UserSkill } from './types'

const SESSION_KEY = 'skillswap_user_id'

/* ── transform DB row → UserProfile ──────────────────────────────────────── */
function toProfile(row: any): UserProfile {
  const teachSkills: UserSkill[] = (row.user_skills ?? [])
    .filter((us: any) => us.kind === 'teach')
    .map((us: any) => ({
      skillId:   us.skill_id,
      skillName: us.skills?.name ?? '',
      kind:      'teach' as const,
      level:     us.level ?? undefined,
    }))
  const learnSkills: UserSkill[] = (row.user_skills ?? [])
    .filter((us: any) => us.kind === 'learn')
    .map((us: any) => ({
      skillId:   us.skill_id,
      skillName: us.skills?.name ?? '',
      kind:      'learn' as const,
    }))
  return {
    id:                row.id,
    displayName:       row.display_name,
    username:          row.username,
    avatarUrl:         row.avatar_url ?? undefined,
    bio:               row.bio ?? undefined,
    location:          row.location ?? undefined,
    status:            row.status ?? 'online',
    gradientIndex:     row.gradient_index ?? 0,
    sessionsCompleted: row.sessions_completed ?? 0,
    rating:            row.rating ?? 0,
    reviewCount:       row.review_count ?? 0,
    isVerified:        row.is_verified ?? false,
    joinedAt:          row.created_at,
    teachSkills,
    learnSkills,
  }
}

/* ── fetch profile by id ──────────────────────────────────────────────────── */
export async function fetchProfileById(id: string): Promise<UserProfile | null> {
  if (!supabase) return null
  try {
    // Race the DB call against a 5-second timeout
    const fetchPromise = supabase
      .from('users')
      .select('*, user_skills(*, skills(*))')
      .eq('id', id)
      .single()

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
    )

    const result = await Promise.race([fetchPromise, timeoutPromise]) as any
    if (result?.error || !result?.data) return null
    return toProfile(result.data)
  } catch {
    return null
  }
}

/* ── sign up ──────────────────────────────────────────────────────────────── */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase not connected' }

  try {
    // Check email already exists
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email.toLowerCase()).maybeSingle()
    if (existing) return { user: null, error: 'An account with this email already exists.' }

    // Check username taken
    const { data: takenUsername } = await supabase
      .from('users').select('id').eq('username', username.toLowerCase()).maybeSingle()
    if (takenUsername) return { user: null, error: 'Username is already taken.' }

    // Hash password
    const hashBuffer   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + email))
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data, error } = await supabase
      .from('users')
      .insert({
        email:              email.toLowerCase(),
        password_hash:      passwordHash,
        display_name:       displayName,
        username:           username.toLowerCase().replace(/\s+/g, '_'),
        status:             'online',
        gradient_index:     Math.floor(Math.random() * 5),
        sessions_completed: 0,
        rating:             0,
        review_count:       0,
        is_verified:        false,
      })
      .select('*, user_skills(*, skills(*))')
      .single()

    if (error) return { user: null, error: error.message }

    const profile = toProfile(data)
    localStorage.setItem(SESSION_KEY, profile.id)
    return { user: profile, error: null }
  } catch (err: any) {
    const msg = err?.message ?? ''
    if (msg.includes('timeout') || msg.includes('fetch') || msg.includes('network')) {
      return { user: null, error: 'Cannot reach the server. Check your connection.' }
    }
    return { user: null, error: msg || 'Sign up failed. Please try again.' }
  }
}

/* ── sign in ──────────────────────────────────────────────────────────────── */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase not connected' }

  try {
    const hashBuffer   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + email))
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data, error } = await supabase
      .from('users')
      .select('*, user_skills(*, skills(*))')
      .eq('email', email.toLowerCase())
      .eq('password_hash', passwordHash)
      .maybeSingle()

    if (error) return { user: null, error: error.message }
    if (!data)  return { user: null, error: 'Incorrect email or password.' }

    const profile = toProfile(data)
    localStorage.setItem(SESSION_KEY, profile.id)
    return { user: profile, error: null }
  } catch (err: any) {
    const msg = err?.message ?? ''
    if (msg.includes('timeout') || msg.includes('fetch') || msg.includes('network')) {
      return { user: null, error: 'Cannot reach the server. Check your connection.' }
    }
    return { user: null, error: msg || 'Sign in failed. Please try again.' }
  }
}

/* ── sign out ─────────────────────────────────────────────────────────────── */
export function signOutSession() {
  localStorage.removeItem(SESSION_KEY)
}

/* ── get stored session user id ───────────────────────────────────────────── */
export function getStoredUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

/* ════════════════════════════════════════════════════════════════════════════
   AUTH CONTEXT
═══════════════════════════════════════════════════════════════════════════ */
interface AuthCtx {
  profileId:  string | null
  profile:    UserProfile | null
  isLoading:  boolean
  isSignedIn: boolean
  signOut:    () => void
  reload:     () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  profileId:  null,
  profile:    null,
  isLoading:  true,
  isSignedIn: false,
  signOut:    () => {},
  reload:     async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profile,   setProfile]   = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    const id = getStoredUserId()
    if (!id) {
      // No session at all — no need to hit the network
      setProfileId(null)
      setProfile(null)
      setIsLoading(false)
      return
    }
    try {
      const p = await fetchProfileById(id)
      if (p) {
        setProfileId(p.id)
        setProfile(p)
      } else {
        // Session expired or network failed — clear it
        signOutSession()
        setProfileId(null)
        setProfile(null)
      }
    } catch {
      setProfileId(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSignOut = () => {
    signOutSession()
    setProfileId(null)
    setProfile(null)
  }

  return (
    <Ctx.Provider value={{
      profileId,
      profile,
      isLoading,
      isSignedIn: !!profileId,
      signOut:    handleSignOut,
      reload:     load,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  return useContext(Ctx)
}
