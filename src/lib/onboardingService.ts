/**
 * SkillAURA — Onboarding Service
 * Saves skills to Supabase users table (no Supabase Auth).
 */
import { createClient } from '@supabase/supabase-js'
import { supabase as _supabase } from './supabase'
import type { SkillLevel } from '../components/ui/SkillPill'

export interface TeachSkill  { name: string; level: SkillLevel }
export interface OnboardingProfile {
  teachSkills: TeachSkill[]
  learnSkills: string[]
  completedAt: string
}

const STORAGE_KEY  = 'SkillAURA_onboarding_v1'
const SESSION_KEY  = 'SkillAURA_user_id'

/** Always returns a live client — reads env vars at call time */
function getClient() {
  if (_supabase) return _supabase
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) return null
  if (!url.startsWith('https://') && !url.startsWith('http://')) return null
  try { return createClient(url, key) } catch { return null }
}

/* ── Supabase save ───────────────────────────────────────────────────────── */
async function supabase_save(teachSkills: TeachSkill[], learnSkills: string[]): Promise<void> {
  const sb = getClient()
  if (!sb) return
  const userId = localStorage.getItem(SESSION_KEY)
  if (!userId) return

  // Collect all skill names
  const allNames = [...teachSkills.map(s => s.name), ...learnSkills]

  // Upsert each skill (insert if not exists)
  for (const name of allNames) {
    await sb.from('skills')
      .upsert({ name, category: 'other', popularity: 50 }, { onConflict: 'name', ignoreDuplicates: true })
  }

  // Fetch skill IDs
  const { data: skillRows } = await sb
    .from('skills').select('id, name').in('name', allNames)
  if (!skillRows) return

  const nameToId: Record<string, string> = {}
  for (const s of skillRows) nameToId[s.name] = s.id

  // Delete old, insert new
  await sb.from('user_skills').delete().eq('user_id', userId)

  const rows = [
    ...teachSkills.map(s => ({
      user_id: userId, skill_id: nameToId[s.name], kind: 'teach', level: s.level,
    })),
    ...learnSkills.map(name => ({
      user_id: userId, skill_id: nameToId[name], kind: 'learn', level: null,
    })),
  ].filter(r => r.skill_id)

  if (rows.length > 0) await sb.from('user_skills').insert(rows)
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
  try { await supabase_save(profile.teachSkills, profile.learnSkills) }
  catch (err) { console.warn('Onboarding save error:', err) }
  return true
}

export function loadOnboardingProfile(): OnboardingProfile | null { return local_load() }
export function clearOnboardingProfile(): void { localStorage.removeItem(STORAGE_KEY) }
export function hasCompletedOnboarding(): boolean { return local_load() !== null }
