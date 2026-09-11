/**
 * SkillSwap — Onboarding Service
 * Saves skills to Supabase users table (no Supabase Auth).
 */
import { supabase, isSupabaseReady } from './supabase'
import type { SkillLevel } from '../components/ui/SkillPill'

export interface TeachSkill  { name: string; level: SkillLevel }
export interface OnboardingProfile {
  teachSkills: TeachSkill[]
  learnSkills: string[]
  completedAt: string
}

const STORAGE_KEY  = 'skillswap_onboarding_v1'
const SESSION_KEY  = 'skillswap_user_id'

/* ── Supabase save ───────────────────────────────────────────────────────── */
async function supabase_save(teachSkills: TeachSkill[], learnSkills: string[]): Promise<void> {
  if (!supabase) return
  const userId = localStorage.getItem(SESSION_KEY)
  if (!userId) return

  // Collect all skill names
  const allNames = [...teachSkills.map(s => s.name), ...learnSkills]

  // Upsert each skill (insert if not exists)
  for (const name of allNames) {
    await supabase.from('skills')
      .upsert({ name, category: 'other', popularity: 50 }, { onConflict: 'name', ignoreDuplicates: true })
  }

  // Fetch skill IDs
  const { data: skillRows } = await supabase
    .from('skills').select('id, name').in('name', allNames)
  if (!skillRows) return

  const nameToId: Record<string, string> = {}
  for (const s of skillRows) nameToId[s.name] = s.id

  // Delete old, insert new
  await supabase.from('user_skills').delete().eq('user_id', userId)

  const rows = [
    ...teachSkills.map(s => ({
      user_id: userId, skill_id: nameToId[s.name], kind: 'teach', level: s.level,
    })),
    ...learnSkills.map(name => ({
      user_id: userId, skill_id: nameToId[name], kind: 'learn', level: null,
    })),
  ].filter(r => r.skill_id)

  if (rows.length > 0) await supabase.from('user_skills').insert(rows)
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
    try { await supabase_save(profile.teachSkills, profile.learnSkills) }
    catch (err) { console.warn('Onboarding save error:', err) }
  }
  return true
}

export function loadOnboardingProfile(): OnboardingProfile | null { return local_load() }
export function clearOnboardingProfile(): void { localStorage.removeItem(STORAGE_KEY) }
export function hasCompletedOnboarding(): boolean { return local_load() !== null }
