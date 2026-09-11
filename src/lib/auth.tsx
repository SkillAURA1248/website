/**
 * SkillSwap — Auth (no Supabase Auth)
 * Users stored in public.users table.
 * Session = localStorage 'skillswap_user_id'.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase as _supabase } from './supabase'
import type { UserProfile, UserSkill } from './types'

const SESSION_KEY = 'skillswap_user_id'

/** Always returns a live client — reads env vars at call time, not module init */
function getClient() {
  if (_supabase) return _supabase
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) return null
  if (!url.startsWith('https://') && !url.startsWith('http://')) return null
  try {
    return createClient(url, key)
  } catch {
    return null
  }
}

/* ── Row → UserProfile ───────────────────────────────────────────────────── */
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
    avatarUrl:         row.avatar_url  ?? undefined,
    bio:               row.bio         ?? undefined,
    location:          row.location    ?? undefined,
    status:            row.status      ?? 'online',
    gradientIndex:     row.gradient_index     ?? 0,
    sessionsCompleted: row.sessions_completed ?? 0,
    rating:            Number(row.rating)     ?? 0,
    reviewCount:       row.review_count       ?? 0,
    isVerified:        row.is_verified        ?? false,
    joinedAt:          row.created_at,
    teachSkills,
    learnSkills,
  }
}

/* ── Hash password ───────────────────────────────────────────────────────── */
async function hashPassword(password: string, email: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password + email.toLowerCase())
  )
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/* ── Fetch profile by stored ID ──────────────────────────────────────────── */
export async function fetchProfileById(id: string): Promise<UserProfile | null> {
  const sb = getClient()
  if (!sb) return null
  try {
    const fetchPromise = sb
      .from('users')
      .select('*, user_skills(*, skills(*))')
      .eq('id', id)
      .single()

    const timeout = new Promise<null>((_, rej) =>
      setTimeout(() => rej(new Error('timeout')), 5000)
    )

    const result = await Promise.race([fetchPromise, timeout]) as any
    if (!result || result.error || !result.data) return null
    return toProfile(result.data)
  } catch {
    return null
  }
}

/* ── Sign up ─────────────────────────────────────────────────────────────── */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const sb = getClient()
  if (!sb) return { user: null, error: `Supabase not connected. VITE_SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL ?? 'missing'}` }

  try {
    // Email taken?
    const { data: existing } = await sb
      .from('users').select('id').eq('email', email.toLowerCase()).maybeSingle()
    if (existing) return { user: null, error: 'An account with this email already exists.' }

    // Username taken?
    const { data: takenUser } = await sb
      .from('users').select('id').eq('username', username.toLowerCase()).maybeSingle()
    if (takenUser) return { user: null, error: 'Username is already taken.' }

    const passwordHash = await hashPassword(password, email)

    const { data, error } = await sb
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
    const msg: string = err?.message ?? String(err)
    console.error('signUp error full:', err)
    return { user: null, error: `Error: ${msg}` }
  }
}

/* ── Sign in ─────────────────────────────────────────────────────────────── */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const sb = getClient()
  if (!sb) return { user: null, error: `Supabase not connected. VITE_SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL ?? 'missing'}` }

  try {
    const passwordHash = await hashPassword(password, email)

    const { data, error } = await sb
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
    const msg: string = err?.message ?? ''
    if (msg.includes('timeout') || msg.includes('fetch') || msg.includes('Failed')) {
      return { user: null, error: 'Cannot reach the server. Check your connection.' }
    }
    return { user: null, error: msg || 'Sign in failed. Please try again.' }
  }
}

/* ── Sign out ────────────────────────────────────────────────────────────── */
export function signOutSession() {
  localStorage.removeItem(SESSION_KEY)
}

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
      // No session — resolve immediately, no network call
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
        // Network failed or session invalid — clear it
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
