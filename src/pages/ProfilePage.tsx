import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Shield, Calendar, MessageCircle, Edit2, Check, Loader2, LogOut } from 'lucide-react'
import Layout from '../components/Layout'
import { SkillPill } from '../components/ui/SkillPill'
import { Button } from '../components/ui/Button'
import { SkillDNA } from '../components/ui/SkillDNA'
import { useAuth } from '../lib/auth'
import { getUserProfileById, getUserProfileByUsername, updateProfile } from '../lib/data'
import type { UserProfile } from '../lib/types'
import type { SkillNode } from '../components/ui/SkillDNA'

const GRADIENTS = [
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
]

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { profile: myProfile, profileId: myProfileId, signOut } = useAuth()

  const [profile,     setProfile]     = useState<UserProfile | null>(null)
  const [isOwn,       setIsOwn]       = useState(false)
  const [isLoading,   setIsLoading]   = useState(true)
  const [editingBio,  setEditingBio]  = useState(false)
  const [bio,         setBio]         = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const load = async () => {
      if (id) {
        // Could be UUID or username
        const isUUID = /^[0-9a-f-]{36}$/i.test(id)
        const p = isUUID
          ? await getUserProfileById(id)
          : await getUserProfileByUsername(id)
        setProfile(p)
        setIsOwn(p?.id === myProfileId)
        setBio(p?.bio ?? '')
      } else {
        // Own profile
        setProfile(myProfile)
        setIsOwn(true)
        setBio(myProfile?.bio ?? '')
      }
      setIsLoading(false)
    }
    load()
  }, [id, myProfile, myProfileId])

  const handleSaveBio = async () => {
    if (!profile) return
    setSaving(true)
    await updateProfile(profile.id, { bio })
    setProfile(prev => prev ? { ...prev, bio } : prev)
    setSaving(false)
    setEditingBio(false)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="text-purple-400 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-white/40">Profile not found.</p>
          <Button variant="secondary" onClick={() => navigate('/discover')}>Back to Discover</Button>
        </div>
      </Layout>
    )
  }

  const dnaNodes: SkillNode[] = [
    ...profile.teachSkills.map((s, i) => ({
      id: `teach-${i}`, label: s.skillName, kind: 'teach' as const,
      level: s.level as any,
      angle: (i * (180 / Math.max(profile.teachSkills.length, 1))) - 90 + 10, dist: 0.78,
    })),
    ...profile.learnSkills.map((s, i) => ({
      id: `learn-${i}`, label: s.skillName, kind: 'learn' as const,
      angle: (i * (180 / Math.max(profile.learnSkills.length, 1))) + 100, dist: 0.78,
    })),
  ]

  return (
    <Layout>
      <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto">
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 md:p-8 border mb-6"
          style={{ background: 'linear-gradient(135deg,#11151D 0%,#151A24 100%)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName}
                className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                style={{ background: GRADIENTS[profile.gradientIndex % 5] }}>
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
                {profile.isVerified && <Shield size={16} className="text-purple-400" />}
              </div>
              <div className="text-sm text-white/40 mb-3">@{profile.username}</div>

              {editingBio ? (
                <div className="flex items-start gap-2">
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    className="flex-1 bg-[#0C1017] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none resize-none"
                    rows={2} placeholder="Write something about yourself…" />
                  <button onClick={handleSaveBio} disabled={saving}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all mt-0.5">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="text-sm text-white/60 leading-relaxed">{bio || 'No bio yet.'}</p>
                  {isOwn && (
                    <button onClick={() => setEditingBio(true)} className="shrink-0 text-white/20 hover:text-white/60 transition-colors">
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/40">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {profile.rating} · {profile.reviewCount} reviews
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />{profile.sessionsCompleted} sessions
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 shrink-0">
              {isOwn ? (
                <>
                  <Button variant="secondary" onClick={() => navigate('/settings')} iconLeft={<Edit2 size={14} />}>
                    Edit Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => { signOut(); navigate('/') }}
                    iconLeft={<LogOut size={14} />}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => navigate('/messages')} iconLeft={<MessageCircle size={14} />}>
                    Message
                  </Button>
                  <Button variant="primary">Propose Swap</Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {[
              { label: 'Match Score',     value: profile.matchScore ? `${profile.matchScore}%` : '—' },
              { label: 'Skills Teaching', value: profile.teachSkills.length },
              { label: 'Skills Learning', value: profile.learnSkills.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 border" style={{ background: '#11151D', borderColor: 'rgba(139,92,246,0.12)' }}>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Can Teach</div>
              <div className="flex flex-wrap gap-2">
                {profile.teachSkills.map(s => (
                  <SkillPill key={s.skillId} skill={s.skillName} level={s.level} selected />
                ))}
                {profile.teachSkills.length === 0 && <p className="text-sm text-white/30">No teaching skills yet.</p>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl p-5 border" style={{ background: '#11151D', borderColor: 'rgba(251,191,36,0.12)' }}>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Wants to Learn</div>
              <div className="flex flex-wrap gap-2">
                {profile.learnSkills.map(s => (
                  <SkillPill key={s.skillId} skill={s.skillName} />
                ))}
                {profile.learnSkills.length === 0 && <p className="text-sm text-white/30">No learning goals yet.</p>}
              </div>
            </motion.div>
          </div>

          {/* Skill DNA */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 border flex items-center justify-center"
            style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center w-full">
              <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Skill DNA</div>
              <div className="flex justify-center">
                <SkillDNA nodes={dnaNodes} centerLabel={profile.displayName.split(' ')[0].toUpperCase()} size={280} animated />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
