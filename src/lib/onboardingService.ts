/**
 * SkillSwap — Onboarding Service
 * Saves completed onboarding data to Supabase (when ready) or localStorage.
 */
import { supabase, isSupabaseReady } from './supabase'
import type { SkillLevel } from '../components/ui/SkillPill'

export interface TeachSkill  { name: string; level: SkillLevel }
export interface OnboardingProfile {
  teachSkills: TeachSkill[]
  learnSkills: string[]
  completedAt: string
}

const STORAGE_KEY = 'skillswap_onboarding_v1'

/* ── Supabase ────────────────────────────────────────────────────────────── */
async function supabase_save(
  teachSkills: TeachSkill[],
  learnSkills: string[],
): Promise<void> {
  if (!supabase) return

  // Get current auth user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get the profile row
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return

  // Resolve skill IDs (insert skill if it doesn't exist)
  const allSkillNames = [
    ...teachSkills.map(s => s.name),
    ...learnSkills,
  ]

  for (const name of allSkillNames) {
    await supabase.from('skills').upsert(
      { name, category: 'other', popularity: 50 },
      { onConflict: 'name', ignoreDuplicates: true }
    )
  }

  // Fetch all skill IDs for these names
  const { data: skillRows } = await supabase
    .from('skills')
    .select('id, name')
    .in('name', allSkillNames)

  if (!skillRows) return

  const nameToId = Object.fromEntries(skillRows.map(s => [s.name, s.id]))

  // Delete old user_skills and re-insert
  await supabase.from('user_skills').delete().eq('user_id', profile.id)

  const rows = [
    ...teachSkills.map(s => ({
      user_id:  profile.id,
      skill_id: nameToId[s.name],
      kind:     'teach' as const,
      level:    s.level,
    })),
    ...learnSkills.map(name => ({
      user_id:  profile.id,
      skill_id: nameToId[name],
      kind:     'learn' as const,
      level:    null,
    })),
  ].filter(r => r.skill_id) // guard against missing lookups

  if (rows.length > 0) {
    await supabase.from('user_skills').insert(rows)
  }
}

/* ── localStorage ────────────────────────────────────────────────────────── */
function local_save(profile: OnboardingProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) } catch {}
}
function local_load(): OnboardingProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/* ── Public API ──────────────────────────────────────────────────────────── */
export async function saveOnboardingProfile(
  profile: Omit<OnboardingProfile, 'completedAt'>
): Promise<boolean> {
  const full: OnboardingProfile = { ...profile, completedAt: new Date().toISOString() }
  local_save(full)

  if (isSupabaseReady) {
    try {
      await supabase_save(profile.teachSkills, profile.learnSkills)
    } catch (err) {
      console.warn('Supabase onboarding save failed, data is in localStorage:', err)
    }
  }
  return true
}

export function loadOnboardingProfile(): OnboardingProfile | null { return local_load() }
export function clearOnboardingProfile(): void { localStorage.removeItem(STORAGE_KEY) }
export function hasCompletedOnboarding(): boolean { return local_load() !== null }
