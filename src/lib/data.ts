/**
 * SkillSwap — Data Layer
 * Uses public.users table (no Supabase Auth).
 * Session = localStorage key 'skillswap_user_id'.
 * All functions return empty / null when Supabase is not available.
 */
import { supabase as _supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'

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

import type {
  UserProfile, Skill, Match,
  Message, Thread, Notification, SkillLevel, UserSkill, PrivacySettings
} from './types'

const SESSION_KEY = 'skillswap_user_id'

/* ─────────────────────────────────────────────────────────────────────────────
   TRANSFORM HELPERS
───────────────────────────────────────────────────────────────────────────── */
function toProfile(row: any): UserProfile {
  const teachSkills: UserSkill[] = (row.user_skills ?? [])
    .filter((us: any) => us.kind === 'teach')
    .map((us: any) => ({
      skillId:   us.skill_id,
      skillName: us.skills?.name ?? '',
      kind:      'teach' as const,
      level:     us.level as SkillLevel | undefined,
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
    rating:            Number(row.rating) ?? 0,
    reviewCount:       row.review_count ?? 0,
    isVerified:        row.is_verified ?? false,
    joinedAt:          row.created_at,
    teachSkills,
    learnSkills,
    matchScore:        row.match_score ?? undefined,
  }
}

function toMessage(row: any): Message {
  return {
    id:        row.id,
    threadId:  row.thread_id,
    senderId:  row.sender_id,
    content:   row.content,
    status:    row.status,
    createdAt: row.created_at,
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   CURRENT USER
───────────────────────────────────────────────────────────────────────────── */
export function getStoredUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = getClient()
  if (!supabase) return null
  const id = getStoredUserId()
  if (!id) return null
  const { data, error } = await supabase
    .from('users')
    .select('*, user_skills(*, skills(*))')
    .eq('id', id)
    .single()
  if (!error && data) return toProfile(data)
  return null
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILES
───────────────────────────────────────────────────────────────────────────── */
export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  const supabase = getClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('*, user_skills(*, skills(*))')
    .eq('id', id)
    .single()
  if (!error && data) return toProfile(data)
  return null
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = getClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('*, user_skills(*, skills(*))')
    .eq('username', username)
    .single()
  if (!error && data) return toProfile(data)
  return null
}

export async function updateProfile(
  userId: string,
  updates: { display_name?: string; bio?: string; location?: string }
): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  return !error
}

/* ─────────────────────────────────────────────────────────────────────────────
   ALL USERS (for "Browse All" mode — ignores skill overlap)
───────────────────────────────────────────────────────────────────────────── */
export async function getAllUsers(): Promise<Match[]> {
  const supabase = getClient()
  if (!supabase) return []
  const myId = getStoredUserId()

  const { data, error } = await supabase
    .from('users')
    .select('*, user_skills(*, skills(*))')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  return data
    .filter((row: any) => row.id !== myId)
    .map((row: any) => {
      const profile = toProfile(row)
      return {
        id:          `match-${profile.id}`,
        userId:      profile.id,
        profile,
        matchScore:  0,
        sharedTeach: profile.teachSkills.map(s => s.skillName),
        sharedLearn: profile.learnSkills.map(s => s.skillName),
        createdAt:   new Date().toISOString(),
      }
    })
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKILLS
───────────────────────────────────────────────────────────────────────────── */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = getClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('skills').select('*').order('popularity', { ascending: false })
  if (!error && data) return data as Skill[]
  return []
}

export async function upsertUserSkills(
  userId: string,
  skills: Array<{ skillId: string; kind: 'teach' | 'learn'; level?: SkillLevel }>
): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  await supabase.from('user_skills').delete().eq('user_id', userId)
  if (skills.length === 0) return true
  const rows = skills.map(s => ({
    user_id:  userId,
    skill_id: s.skillId,
    kind:     s.kind,
    level:    s.level ?? null,
  }))
  const { error } = await supabase.from('user_skills').insert(rows)
  return !error
}

/* ─────────────────────────────────────────────────────────────────────────────
   MATCHES
───────────────────────────────────────────────────────────────────────────── */
export async function getMatches(): Promise<Match[]> {
  const supabase = getClient()
  if (!supabase) return []
  const myId = getStoredUserId()
  if (!myId) return []

  const me = await getCurrentUserProfile()
  if (!me) return []
  const myTeach = me.teachSkills.map(s => s.skillName)
  const myLearn = me.learnSkills.map(s => s.skillName)

  const { data, error } = await supabase
    .from('users')
    .select('*, user_skills(*, skills(*))')
    .neq('id', myId)
    .limit(50)

  if (error || !data) return []

  return data
    .map((row: any) => {
      const profile     = toProfile(row)
      const theirTeach  = profile.teachSkills.map(s => s.skillName)
      const theirLearn  = profile.learnSkills.map(s => s.skillName)
      const sharedTeach = theirTeach.filter(s => myLearn.includes(s))
      const sharedLearn = myTeach.filter(s => theirLearn.includes(s))
      const total       = Math.max(myTeach.length + myLearn.length, 1)
      const matchScore  = Math.min(
        Math.round(((sharedTeach.length + sharedLearn.length) / total) * 100), 100
      )
      return { profile, sharedTeach, sharedLearn, matchScore }
    })
    .filter(m => m.sharedTeach.length > 0 || m.sharedLearn.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(m => ({
      id:          `match-${m.profile.id}`,
      userId:      m.profile.id,
      profile:     m.profile,
      matchScore:  m.matchScore,
      sharedTeach: m.sharedTeach,
      sharedLearn: m.sharedLearn,
      createdAt:   new Date().toISOString(),
    }))
}

export async function getMatchById(id: string): Promise<Match | null> {
  const supabase = getClient()
  if (!supabase) return null
  const myId = getStoredUserId()
  if (!myId) return null

  // id can be `match-<userId>` or a raw userId
  const userId = id.startsWith('match-') ? id.slice(6) : id

  const me = await getCurrentUserProfile()
  if (!me) return null
  const myTeach = me.teachSkills.map(s => s.skillName)
  const myLearn = me.learnSkills.map(s => s.skillName)

  const { data, error } = await supabase
    .from('users')
    .select('*, user_skills(*, skills(*))')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  const profile     = toProfile(data)
  const theirTeach  = profile.teachSkills.map(s => s.skillName)
  const theirLearn  = profile.learnSkills.map(s => s.skillName)
  const sharedTeach = theirTeach.filter(s => myLearn.includes(s))
  const sharedLearn = myTeach.filter(s => theirLearn.includes(s))
  const total       = Math.max(myTeach.length + myLearn.length, 1)
  const matchScore  = Math.min(
    Math.round(((sharedTeach.length + sharedLearn.length) / total) * 100), 100
  )

  return {
    id:          `match-${profile.id}`,
    userId:      profile.id,
    profile,
    matchScore,
    sharedTeach,
    sharedLearn,
    createdAt:   new Date().toISOString(),
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   THREADS & MESSAGES
───────────────────────────────────────────────────────────────────────────── */
export async function getThreads(): Promise<Thread[]> {
  const supabase = getClient()
  if (!supabase) return []
  const myId = getStoredUserId()
  if (!myId) return []

  const { data: myRows } = await supabase
    .from('thread_participants').select('thread_id').eq('user_id', myId)
  if (!myRows?.length) return []

  const threadIds = myRows.map((r: any) => r.thread_id)
  const threads: Thread[] = []

  for (const threadId of threadIds) {
    const { data: partRows } = await supabase
      .from('thread_participants').select('user_id').eq('thread_id', threadId)
    const participantIds = (partRows ?? []).map((r: any) => r.user_id)

    const { data: userRows } = await supabase
      .from('users').select('*, user_skills(*, skills(*))').in('id', participantIds)

    const { data: lastMsg } = await supabase
      .from('messages').select('*').eq('thread_id', threadId)
      .order('created_at', { ascending: false }).limit(1)

    const { count: unread } = await supabase
      .from('messages').select('*', { count: 'exact', head: true })
      .eq('thread_id', threadId).eq('status', 'sent').neq('sender_id', myId)

    threads.push({
      id:           threadId,
      participants: (userRows ?? []).map(toProfile),
      lastMessage:  lastMsg?.[0] ? toMessage(lastMsg[0]) : undefined,
      unreadCount:  unread ?? 0,
      updatedAt:    lastMsg?.[0]?.created_at ?? new Date().toISOString(),
    })
  }

  return threads.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export async function getMessages(threadId: string): Promise<Message[]> {
  const supabase = getClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('messages').select('*').eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (!error && data) return data.map(toMessage)
  return []
}

export async function sendMessage(
  threadId: string, content: string, senderId: string
): Promise<Message | null> {
  const supabase = getClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, sender_id: senderId, content, status: 'sent' })
    .select().single()
  if (!error && data) return toMessage(data)
  return null
}

export async function getOrCreateThread(myId: string, otherId: string): Promise<string | null> {
  const supabase = getClient()
  if (!supabase) return null

  const { data: myThreads } = await supabase
    .from('thread_participants').select('thread_id').eq('user_id', myId)
  const myThreadIds = (myThreads ?? []).map((r: any) => r.thread_id)

  if (myThreadIds.length > 0) {
    const { data: existing } = await supabase
      .from('thread_participants').select('thread_id')
      .eq('user_id', otherId).in('thread_id', myThreadIds)
    if (existing?.[0]) return existing[0].thread_id
  }

  const { data: newThread } = await supabase
    .from('threads').insert({}).select().single()
  if (newThread) {
    await supabase.from('thread_participants').insert([
      { thread_id: newThread.id, user_id: myId },
      { thread_id: newThread.id, user_id: otherId },
    ])
    return newThread.id
  }
  return null
}

/* ─────────────────────────────────────────────────────────────────────────────
   SWAP REQUESTS
───────────────────────────────────────────────────────────────────────────── */
export async function createSwapRequest(
  fromId: string, toId: string,
  teachSkill: string, learnSkill: string, message?: string
): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const { error } = await supabase.from('swap_requests').insert({
    from_user_id: fromId, to_user_id: toId,
    teach_skill: teachSkill, learn_skill: learnSkill,
    status: 'pending', message: message ?? null, duration: 60,
  })
  return !error
}

/* ─────────────────────────────────────────────────────────────────────────────
   SESSION & RATING
───────────────────────────────────────────────────────────────────────────── */

/** Returns whether the current user has already marked this thread as done */
export async function hasMarkedSessionDone(threadId: string): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const myId = getStoredUserId()
  if (!myId) return false
  const { data } = await supabase
    .from('session_completions')
    .select('id')
    .eq('thread_id', threadId)
    .eq('marked_by', myId)
    .maybeSingle()
  return !!data
}

/** Returns whether the current user has already rated someone in this thread */
export async function hasRatedInThread(threadId: string): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const myId = getStoredUserId()
  if (!myId) return false
  const { data } = await supabase
    .from('session_reviews')
    .select('id')
    .eq('thread_id', threadId)
    .eq('rater_id', myId)
    .maybeSingle()
  return !!data
}

export async function markSessionDone(threadId: string, otherUserId: string): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const myId = getStoredUserId()
  if (!myId) return false

  // Prevent duplicate — check first
  const already = await hasMarkedSessionDone(threadId)
  if (already) return true

  // Record the completion
  await supabase.from('session_completions').insert({ thread_id: threadId, marked_by: myId })

  // Increment sessions_completed for both participants
  for (const userId of [myId, otherUserId]) {
    const { data: current } = await supabase
      .from('users').select('sessions_completed').eq('id', userId).single()
    if (current) {
      await supabase
        .from('users')
        .update({ sessions_completed: (current.sessions_completed ?? 0) + 1 })
        .eq('id', userId)
    }
  }
  return true
}

export async function submitRating(
  threadId: string,
  targetUserId: string,
  stars: number            // 1–5
): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const myId = getStoredUserId()
  if (!myId) return false

  // Prevent duplicate rating in this thread
  const already = await hasRatedInThread(threadId)
  if (already) return true

  // Record the review
  const { error: reviewError } = await supabase
    .from('session_reviews')
    .insert({ rater_id: myId, rated_id: targetUserId, thread_id: threadId, stars })
  if (reviewError) return false

  // Recalculate running average
  const { data: current } = await supabase
    .from('users').select('rating, review_count').eq('id', targetUserId).single()
  if (!current) return false
  const oldRating  = Number(current.rating) || 0
  const oldCount   = Number(current.review_count) || 0
  const newCount   = oldCount + 1
  const newRating  = Math.round(((oldRating * oldCount + stars) / newCount) * 100) / 100
  const { error } = await supabase
    .from('users')
    .update({ rating: newRating, review_count: newCount })
    .eq('id', targetUserId)
  return !error
}

/* ─────────────────────────────────────────────────────────────────────────────
   PRIVACY SETTINGS
───────────────────────────────────────────────────────────────────────────── */
export async function getPrivacySettings(): Promise<PrivacySettings> {
  const defaults: PrivacySettings = {
    showLocation: true, showSkillDna: true,
    showOnlineStatus: true, allowDirectMessages: true,
  }
  const supabase = getClient()
  if (!supabase) return defaults
  const id = getStoredUserId()
  if (!id) return defaults
  const { data, error } = await supabase
    .from('users')
    .select('show_location, show_skill_dna, show_online_status, allow_direct_messages')
    .eq('id', id)
    .single()
  if (error || !data) return defaults
  return {
    showLocation:        data.show_location        ?? true,
    showSkillDna:        data.show_skill_dna        ?? true,
    showOnlineStatus:    data.show_online_status    ?? true,
    allowDirectMessages: data.allow_direct_messages ?? true,
  }
}

export async function savePrivacySettings(settings: PrivacySettings): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false
  const id = getStoredUserId()
  if (!id) return false
  const { error } = await supabase
    .from('users')
    .update({
      show_location:         settings.showLocation,
      show_skill_dna:        settings.showSkillDna,
      show_online_status:    settings.showOnlineStatus,
      allow_direct_messages: settings.allowDirectMessages,
    })
    .eq('id', id)
  return !error
}

/* ─────────────────────────────────────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────────────────────────────────────── */
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = getClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('notifications').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(20)
  if (!error && data) return data.map((row: any) => ({
    id: row.id, type: row.type, title: row.title,
    body: row.body, read: row.read,
    linkTo: row.link_to, createdAt: row.created_at,
  }))
  return []
}
