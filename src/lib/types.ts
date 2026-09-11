/* ─────────────────────────────────────────────────────────────────────────────
   SkillSwap — Domain Types
───────────────────────────────────────────────────────────────────────────── */

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type SkillKind  = 'teach' | 'learn'
export type SwapStatus = 'pending' | 'accepted' | 'declined' | 'completed'
export type MessageStatus = 'sent' | 'delivered' | 'read'
export type SessionStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
export type UserStatus = 'online' | 'offline' | 'away' | 'available'

/* ── Skill ───────────────────────────────────────────────────────────────── */
export interface Skill {
  id:         string
  name:       string
  category:   SkillCategory
  icon?:      string
  popularity?: number
}

export type SkillCategory =
  | 'design'
  | 'development'
  | 'photography'
  | 'music'
  | 'marketing'
  | 'productivity'
  | 'language'
  | 'other'

export interface UserSkill {
  skillId:  string
  skillName: string
  kind:     SkillKind
  level?:   SkillLevel   // only relevant for teach skills
}

/* ── User / Profile ──────────────────────────────────────────────────────── */
export interface UserProfile {
  id:          string
  displayName: string
  username:    string
  avatarUrl?:  string
  bio?:        string
  location?:   string
  status:      UserStatus
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
  matchScore?: number         // computed per-viewer, 0-100
  joinedAt:    string         // ISO
  sessionsCompleted: number
  rating:      number         // 0-5
  reviewCount: number
  isVerified:  boolean
  gradientIndex: number       // 0-4 for avatar colour
}

/* ── Match ───────────────────────────────────────────────────────────────── */
export interface Match {
  id:           string
  userId:       string
  profile:      UserProfile
  matchScore:   number
  sharedTeach:  string[]   // skills they teach that I want to learn
  sharedLearn:  string[]   // skills I teach that they want to learn
  createdAt:    string
}

/* ── Swap Request ────────────────────────────────────────────────────────── */
export interface SwapRequest {
  id:           string
  fromUserId:   string
  toUserId:     string
  fromProfile:  UserProfile
  toProfile:    UserProfile
  teachSkill:   string
  learnSkill:   string
  status:       SwapStatus
  message?:     string
  createdAt:    string
  scheduledAt?: string
  duration:     number   // minutes
}

/* ── Message ─────────────────────────────────────────────────────────────── */
export interface Message {
  id:        string
  threadId:  string
  senderId:  string
  content:   string
  status:    MessageStatus
  createdAt: string
}

/* ── Thread ──────────────────────────────────────────────────────────────── */
export interface Thread {
  id:            string
  participants:  UserProfile[]
  lastMessage?:  Message
  unreadCount:   number
  swapRequest?:  SwapRequest
  updatedAt:     string
}

/* ── Session (completed swap) ────────────────────────────────────────────── */
export interface Session {
  id:          string
  participants: UserProfile[]
  teachSkill:  string
  learnSkill:  string
  status:      SessionStatus
  scheduledAt: string
  duration:    number
  notes?:      string
  rating?:     number
}

/* ── Notification ────────────────────────────────────────────────────────── */
export interface Notification {
  id:        string
  type:      'match' | 'message' | 'swap_request' | 'swap_accepted' | 'session_reminder'
  title:     string
  body:      string
  read:      boolean
  linkTo?:   string
  createdAt: string
}

/* ── Auth ────────────────────────────────────────────────────────────────── */
export interface AuthUser {
  id:    string
  email: string
}

export interface AuthState {
  user:        AuthUser | null
  profile:     UserProfile | null
  isLoading:   boolean
  isSignedIn:  boolean
}
