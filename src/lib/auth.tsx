/**
 * SkillSwap — Auth State
 * React context that holds the signed-in user + their profile.
 * All pages import useAuth() to read current user.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseReady } from './supabase'
import { getCurrentUserProfile } from './data'
import type { UserProfile } from './types'

interface AuthCtx {
  userId:     string | null   // Supabase auth UID
  profileId:  string | null   // profiles.id (UUID)
  profile:    UserProfile | null
  isLoading:  boolean
  isSignedIn: boolean
  signOut:    () => Promise<void>
  reload:     () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  userId:    null,
  profileId: null,
  profile:   null,
  isLoading: true,
  isSignedIn: false,
  signOut:   async () => {},
  reload:    async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId,    setUserId]    = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profile,   setProfile]   = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    if (isSupabaseReady && supabase) {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        const p = await getCurrentUserProfile()
        setProfile(p)
        setProfileId(p?.id ?? null)
      } else {
        setProfile(null)
        setProfileId(null)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    load()
    if (isSupabaseReady && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
      return () => subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    if (isSupabaseReady && supabase) await supabase.auth.signOut()
    setUserId(null)
    setProfileId(null)
    setProfile(null)
  }

  return (
    <Ctx.Provider value={{
      userId, profileId, profile, isLoading,
      isSignedIn: !!userId,
      signOut,
      reload: load,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  return useContext(Ctx)
}
