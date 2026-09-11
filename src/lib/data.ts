/**
 * SkillSwap — Data Layer
 * Uses public.users table (no Supabase Auth).
 * Session = localStorage key 'skillswap_user_id'.
 * Falls back to mock data when Supabase is not connected.
 */
import { supabase as _supabase, isSupabaseReady } from './supabase'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  if (_supabase) return _supabase
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key) return createClient(url, key)
  return null
}

function isReady() {
  return !!getClient()
}
import type {
  UserProfile, Skill, Match,
  Message, Thread, Notification, AuthState, SkillLevel, UserSkill
} from './types'

const SESSION_KEY = 'skillswap_user_id'

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────────────────── */
export const MOCK_SKILLS: Skill[] = [
  { id: 'skill-1',  name: 'Figma',           category: 'design',       icon: 'Palette',    popularity: 95 },
  { id: 'skill-2',  name: 'UI Design',        category: 'design',       icon: 'Layout',     popularity: 85 },
  { id: 'skill-3',  name: 'Photoshop',        category: 'design',       icon: 'Image',      popularity: 75 },
  { id: 'skill-4',  name: 'Illustrator',      category: 'design',       icon: 'PenTool',    popularity: 65 },
  { id: 'skill-5',  name: 'Branding',         category: 'design',       icon: 'Tag',        popularity: 60 },
  { id: 'skill-6',  name: 'Prototyping',      category: 'design',       icon: 'Cpu',        popularity: 55 },
  { id: 'skill-7',  name: 'React',            category: 'development',  icon: 'Code',       popularity: 90 },
  { id: 'skill-8',  name: 'TypeScript',       category: 'development',  icon: 'FileCode',   popularity: 80 },
  { id: 'skill-9',  name: 'HTML / CSS',       category: 'development',  icon: 'Globe',      popularity: 85 },
  { id: 'skill-10', name: 'Node.js',          category: 'development',  icon: 'Server',     popularity: 70 },
  { id: 'skill-11', name: 'Python',           category: 'development',  icon: 'Terminal',   popularity: 75 },
  { id: 'skill-12', name: 'Next.js',          category: 'development',  icon: 'ArrowRight', popularity: 65 },
  { id: 'skill-13', name: 'Photography',      category: 'photography',  icon: 'Camera',     popularity: 80 },
  { id: 'skill-14', name: 'Lightroom',        category: 'photography',  icon: 'Sliders',    popularity: 65 },
  { id: 'skill-15', name: 'Video Editing',    category: 'photography',  icon: 'Video',      popularity: 70 },
  { id: 'skill-16', name: 'Color Grading',    category: 'photography',  icon: 'Droplet',    popularity: 55 },
  { id: 'skill-17', name: 'Guitar',           category: 'music',        icon: 'Music',      popularity: 60 },
  { id: 'skill-18', name: 'Piano',            category: 'music',        icon: 'Music2',     popularity: 55 },
  { id: 'skill-19', name: 'Music Production', category: 'music',        icon: 'Headphones', popularity: 50 },
  { id: 'skill-20', name: 'Marketing',        category: 'marketing',    icon: 'Megaphone',  popularity: 70 },
  { id: 'skill-21', name: 'Content Writing',  category: 'marketing',    icon: 'Edit',       popularity: 60 },
  { id: 'skill-22', name: 'SEO',              category: 'marketing',    icon: 'Search',     popularity: 55 },
  { id: 'skill-23', name: 'Excel',            category: 'productivity', icon: 'Table',      popularity: 65 },
  { id: 'skill-24', name: 'Notion',           category: 'productivity', icon: 'BookOpen',   popularity: 50 },
  { id: 'skill-25', name: 'Spanish',          category: 'language',     icon: 'Languages',  popularity: 60 },
  { id: 'skill-26', name: 'Japanese',         category: 'language',     icon: 'Flag',       popularity: 45 },
  { id: 'skill-27', name: 'Cooking',          category: 'other',        icon: 'Utensils',   popularity: 55 },
  { id: 'skill-28', name: 'Yoga',             category: 'other',        icon: 'Heart',      popularity: 40 },
]

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'user-1', displayName: 'Alex Morgan', username: 'alex',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'UI designer & photography enthusiast.',
    location: 'San Francisco', status: 'online',
    teachSkills: [
      { skillId: 'skill-1', skillName: 'Figma',     kind: 'teach', level: 'expert' },
      { skillId: 'skill-2', skillName: 'UI Design', kind: 'teach', level: 'expert' },
    ],
    learnSkills: [
      { skillId: 'skill-13', skillName: 'Photography', kind: 'learn' },
    ],
    matchScore: 94, gradientIndex: 0, sessionsCompleted: 8,
    rating: 4.7, reviewCount: 12, isVerified: true, joinedAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'user-2', displayName: 'Ananya Krishnan', username: 'ananya',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    bio: 'Visual storyteller from Bangalore.',
    location: 'Bangalore', status: 'online',
    teachSkills: [
      { skillId: 'skill-13', skillName: 'Photography', kind: 'teach', level: 'advanced' },
      { skillId: 'skill-14', skillName: 'Lightroom',   kind: 'teach', level: 'advanced' },
    ],
    learnSkills: [
      { skillId: 'skill-1', skillName: 'Figma',     kind: 'learn' },
      { skillId: 'skill-2', skillName: 'UI Design', kind: 'learn' },
    ],
    matchScore: 94, gradientIndex: 1, sessionsCompleted: 24,
    rating: 4.9, reviewCount: 32, isVerified: true, joinedAt: '2023-11-22T14:20:00Z',
  },
  {
    id: 'user-3', displayName: 'Luca Moretti', username: 'luca',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luca',
    bio: 'Frontend engineer from Berlin.',
    location: 'Berlin', status: 'available',
    teachSkills: [
      { skillId: 'skill-7', skillName: 'React',      kind: 'teach', level: 'advanced' },
      { skillId: 'skill-8', skillName: 'TypeScript', kind: 'teach', level: 'advanced' },
    ],
    learnSkills: [
      { skillId: 'skill-2', skillName: 'UI Design', kind: 'learn' },
    ],
    matchScore: 87, gradientIndex: 2, sessionsCompleted: 16,
    rating: 4.5, reviewCount: 18, isVerified: true, joinedAt: '2024-01-10T09:45:00Z',
  },
  {
    id: 'user-4', displayName: 'Priya Nair', username: 'priya',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    bio: 'Illustrator from Mumbai.',
    location: 'Mumbai', status: 'online',
    teachSkills: [
      { skillId: 'skill-4', skillName: 'Illustrator', kind: 'teach', level: 'expert' },
    ],
    learnSkills: [
      { skillId: 'skill-9', skillName: 'HTML / CSS', kind: 'learn' },
    ],
    matchScore: 81, gradientIndex: 3, sessionsCompleted: 12,
    rating: 4.8, reviewCount: 20, isVerified: false, joinedAt: '2024-02-28T11:15:00Z',
  },
]

export const CURRENT_USER_ID = 'user-1'
export const CURRENT_USER    = MOCK_PROFILES[0]

export const MOCK_MATCHES: Match[] = [
  {
    id: 'match-1', userId: 'user-2', profile: MOCK_PROFILES[1], matchScore: 94,
    sharedTeach: ['Photography', 'Lightroom'], sharedLearn: ['Figma', 'UI Design'],
    createdAt: '2024-09-07T10:30:00Z',
  },
  {
    id: 'match-2', userId: 'user-3', profile: MOCK_PROFILES[2], matchScore: 87,
    sharedTeach: ['React', 'TypeScript'], sharedLearn: ['UI Design'],
    createdAt: '2024-09-06T14:20:00Z',
  },
  {
    id: 'match-3', userId: 'user-4', profile: MOCK_PROFILES[3], matchScore: 81,
    sharedTeach: ['Illustrator'], sharedLearn: ['HTML / CSS'],
    createdAt: '2024-09-05T16:45:00Z',
  },
]

export const MOCK_MESSAGES: Message[] = [
  { id: 'msg-1', threadId: 'thread-1', senderId: 'user-2', status: 'read',
    content: "Hi! I'd love to swap skills with you.", createdAt: '2024-09-07T10:32:00Z' },
  { id: 'msg-2', threadId: 'thread-1', senderId: 'user-1', status: 'delivered',
    content: 'Sounds great! When are you free?', createdAt: '2024-09-07T10:35:00Z' },
]

export const MOCK_THREADS: Thread[] = [
  {
    id: 'thread-1', participants: [MOCK_PROFILES[0], MOCK_PROFILES[1]],
    lastMessage: MOCK_MESSAGES[1], unreadCount: 0, updatedAt: '2024-09-07T10:35:00Z',
  },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1', type: 'match', title: 'New match!',
    body: 'Ananya wants to learn Figma', read: false,
    linkTo: '/discover', createdAt: '2024-09-07T10:30:00Z',
  },
]

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

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const supabase = getClient(); if (supabase) {
    const id = getStoredUserId()
    if (id) {
      const { data, error } = await supabase
        .from('users')
        .select('*, user_skills(*, skills(*))')
        .eq('id', id)
        .single()
      if (!error && data) return toProfile(data)
    }
  }
  return CURRENT_USER
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILES
───────────────────────────────────────────────────────────────────────────── */
export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  const supabase = getClient(); if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_skills(*, skills(*))')
      .eq('id', id)
      .single()
    if (!error && data) return toProfile(data)
    return null
  }
  return MOCK_PROFILES.find(p => p.id === id) ?? null
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = getClient(); if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_skills(*, skills(*))')
      .eq('username', username)
      .single()
    if (!error && data) return toProfile(data)
    return null
  }
  return MOCK_PROFILES.find(p => p.username === username) ?? null
}

export async function updateProfile(
  userId: string,
  updates: { display_name?: string; bio?: string; location?: string }
): Promise<boolean> {
  const supabase = getClient(); if (supabase) {
    const { error } = await supabase.from('users').update(updates).eq('id', userId)
    return !error
  }
  return true
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKILLS
───────────────────────────────────────────────────────────────────────────── */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = getClient(); if (supabase) {
    const { data, error } = await supabase
      .from('skills').select('*').order('popularity', { ascending: false })
    if (!error && data) return data as Skill[]
  }
  return MOCK_SKILLS
}

export async function upsertUserSkills(
  userId: string,
  skills: Array<{ skillId: string; kind: 'teach' | 'learn'; level?: SkillLevel }>
): Promise<boolean> {
  const supabase = getClient(); if (supabase) {
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
  return true
}

/* ─────────────────────────────────────────────────────────────────────────────
   MATCHES
───────────────────────────────────────────────────────────────────────────── */
export async function getMatches(): Promise<Match[]> {
  const supabase = getClient(); if (supabase) {
    const myId = getStoredUserId()
    if (!myId) return []

    const me = await getCurrentUserProfile()
    const myTeach = me.teachSkills.map(s => s.skillName)
    const myLearn = me.learnSkills.map(s => s.skillName)

    const { data, error } = await supabase
      .from('users')
      .select('*, user_skills(*, skills(*))')
      .neq('id', myId)
      .limit(50)

    if (!error && data) {
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
  }
  return MOCK_MATCHES
}

/* ─────────────────────────────────────────────────────────────────────────────
   THREADS & MESSAGES
───────────────────────────────────────────────────────────────────────────── */
export async function getThreads(): Promise<Thread[]> {
  const supabase = getClient(); if (supabase) {
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
  return MOCK_THREADS
}

export async function getMessages(threadId: string): Promise<Message[]> {
  const supabase = getClient(); if (supabase) {
    const { data, error } = await supabase
      .from('messages').select('*').eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    if (!error && data) return data.map(toMessage)
  }
  return MOCK_MESSAGES.filter(m => m.threadId === threadId)
}

export async function sendMessage(
  threadId: string, content: string, senderId: string
): Promise<Message | null> {
  const supabase = getClient(); if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ thread_id: threadId, sender_id: senderId, content, status: 'sent' })
      .select().single()
    if (!error && data) return toMessage(data)
    return null
  }
  return {
    id: `msg-${Date.now()}`, threadId, senderId, content,
    status: 'sent', createdAt: new Date().toISOString(),
  }
}

export async function getOrCreateThread(myId: string, otherId: string): Promise<string> {
  const supabase = getClient(); if (supabase) {
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
  }
  return 'thread-1'
}

/* ─────────────────────────────────────────────────────────────────────────────
   SWAP REQUESTS
───────────────────────────────────────────────────────────────────────────── */
export async function createSwapRequest(
  fromId: string, toId: string,
  teachSkill: string, learnSkill: string, message?: string
): Promise<boolean> {
  const supabase = getClient(); if (supabase) {
    const { error } = await supabase.from('swap_requests').insert({
      from_user_id: fromId, to_user_id: toId,
      teach_skill: teachSkill, learn_skill: learnSkill,
      status: 'pending', message: message ?? null, duration: 60,
    })
    return !error
  }
  return true
}

/* ─────────────────────────────────────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────────────────────────────────────── */
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = getClient(); if (supabase) {
    const { data, error } = await supabase
      .from('notifications').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(20)
    if (!error && data) return data.map((row: any) => ({
      id: row.id, type: row.type, title: row.title,
      body: row.body, read: row.read,
      linkTo: row.link_to, createdAt: row.created_at,
    }))
  }
  return MOCK_NOTIFICATIONS
}

export const MOCK_AUTH_STATE: AuthState = {
  user:      { id: 'auth-user-1', email: 'alex@example.com' },
  profile:   CURRENT_USER,
  isLoading: false,
  isSignedIn: true,
}
