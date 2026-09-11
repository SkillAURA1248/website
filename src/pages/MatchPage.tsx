import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, MapPin, Star, Shield, Calendar, Clock, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { PerfectSwap } from '../components/ui/PerfectSwap'
import { SkillPill } from '../components/ui/SkillPill'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { getMatchById, createSwapRequest, getOrCreateThread } from '../lib/data'
import type { Match } from '../lib/types'

const GRADIENTS = [
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
]

export default function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile: me, profileId: myProfileId } = useAuth()

  // Use match passed via router state (from DiscoverPage) — avoids a second fetch
  const stateMatch = (location.state as any)?.match as Match | undefined

  const [match,       setMatch]       = useState<Match | null>(stateMatch ?? null)
  const [swapSent,    setSwapSent]    = useState(false)
  const [swapLoading, setSwapLoading] = useState(false)
  const [isLoading,   setIsLoading]   = useState(!stateMatch)

  useEffect(() => {
    // Only fetch from Supabase if we didn't get the match via router state
    if (stateMatch) return
    if (!id) { setIsLoading(false); return }
    getMatchById(id).then(found => {
      setMatch(found)
      setIsLoading(false)
    })
  }, [id])

  const handleProposeSwap = async () => {
    if (!match || !myProfileId) return
    setSwapLoading(true)
    await createSwapRequest(
      myProfileId,
      match.profile.id,
      match.sharedLearn[0] ?? '',
      match.sharedTeach[0] ?? '',
      `Hi ${match.profile.displayName}! I'd love to swap skills with you.`
    )
    setSwapSent(true)
    setSwapLoading(false)
  }

  const handleMessage = async () => {
    if (!match || !myProfileId) return
    const threadId = await getOrCreateThread(myProfileId, match.profile.id)
    if (threadId) navigate('/messages')
  }

  if (isLoading || !match) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="text-purple-400 animate-spin" />
        </div>
      </Layout>
    )
  }

  const { profile } = match

  return (
    <Layout>
      <div className="px-4 md:px-6 py-8 max-w-4xl mx-auto">
        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </motion.button>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Match with {profile.displayName}
          </h1>
          <div className="px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}>
            {match.matchScore}% Match
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Profile details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl p-6 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-4 mb-4">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                    style={{ background: GRADIENTS[profile.gradientIndex % 5] }}>
                    {profile.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white">{profile.displayName}</h2>
                    {profile.isVerified && <Shield size={14} className="text-purple-400" />}
                  </div>
                  <div className="text-sm text-white/40">@{profile.username}</div>
                </div>
              </div>

              {profile.bio && <p className="text-sm text-white/60 mb-4 leading-relaxed">{profile.bio}</p>}

              <div className="flex flex-wrap gap-3 text-xs text-white/40">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {profile.rating} ({profile.reviewCount})
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />{profile.sessionsCompleted} sessions
                </span>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 border space-y-4" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">They Can Teach You</div>
                <div className="flex flex-wrap gap-2">
                  {match.sharedTeach.map(s => <SkillPill key={s} skill={s} selected />)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">They Want to Learn</div>
                <div className="flex flex-wrap gap-2">
                  {match.sharedLearn.map(s => <SkillPill key={s} skill={s} />)}
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleMessage} iconLeft={<MessageCircle size={15} />}>
                Message
              </Button>
              <Button variant="primary" fullWidth onClick={handleProposeSwap}
                loading={swapLoading} iconLeft={!swapLoading ? <Clock size={15} /> : undefined}>
                {swapSent ? '✓ Sent!' : 'Propose Swap'}
              </Button>
            </motion.div>
          </div>

          {/* PerfectSwap viz */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Perfect Swap</div>
              <PerfectSwap
                you={{
                  name:       me?.displayName ?? 'You',
                  skill:      match.sharedLearn[0] ?? 'Your Skill',
                  level:      me?.teachSkills[0]?.level ?? 'intermediate',
                  initials:   (me?.displayName ?? 'YO').slice(0, 2).toUpperCase(),
                  colorIndex: me?.gradientIndex ?? 0,
                }}
                them={{
                  name:       profile.displayName,
                  skill:      match.sharedTeach[0] ?? 'Their Skill',
                  level:      profile.teachSkills[0]?.level ?? 'advanced',
                  initials:   profile.displayName.slice(0, 2).toUpperCase(),
                  colorIndex: profile.gradientIndex,
                }}
                matchPercent={match.matchScore}
                duration="60 MIN"
                onAccept={handleProposeSwap}
                onDecline={() => navigate('/discover')}
              />
            </motion.div>

            {/* Why great */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-6 rounded-2xl p-5 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-bold text-white mb-4">Why this is a great swap</h3>
              <div className="space-y-3">
                {[
                  { icon: '🎯', text: `${match.matchScore}% skill compatibility` },
                  { icon: '⚡', text: `${profile.sessionsCompleted} sessions completed` },
                  { icon: '⭐', text: `Rated ${profile.rating}/5 by ${profile.reviewCount} learners` },
                  { icon: '📍', text: profile.location ? `Based in ${profile.location}` : 'Remote-friendly' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="text-base">{item.icon}</span>{item.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
