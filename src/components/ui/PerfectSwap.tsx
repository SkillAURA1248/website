import { motion } from 'framer-motion'
import type { SkillLevel } from './SkillPill'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface SwapProfile {
  name:       string
  skill:      string
  level:      SkillLevel
  initials?:  string
  /** gradient index 0–4 */
  colorIndex?: number
}

interface PerfectSwapProps {
  you:          SwapProfile
  them:         SwapProfile
  matchPercent: number
  duration?:    string         // e.g. "60 MIN"
  className?:   string
  onAccept?:    () => void
  onDecline?:   () => void
}

/* ─── Level display ──────────────────────────────────────────────────────── */
const LEVEL_ICONS: Record<SkillLevel, string> = {
  beginner:     '🌱',
  intermediate: '⚡',
  advanced:     '🔥',
  expert:       '◆',
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
]

/* ─── Animated connection line SVG ───────────────────────────────────────── */
function ConnectionBeam() {
  return (
    <svg
      className="w-full h-full absolute inset-0 pointer-events-none overflow-visible"
      viewBox="0 0 200 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#8B5CF6" stopOpacity="0.8" />
          <stop offset="40%"  stopColor="#A97EFF" stopOpacity="0.5" />
          <stop offset="60%"  stopColor="#A97EFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.7" />
        </linearGradient>
        <filter id="beam-glow" x="-100%" y="-30%" width="300%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Travelling dot */}
        <circle id="dot" r="3" fill="white" fillOpacity="0.85" />
      </defs>

      {/* Main beam */}
      <motion.path
        d="M 100 8 L 100 112"
        stroke="url(#beam-grad)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="6 4"
        filter="url(#beam-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Downward travelling dot */}
      <motion.circle
        r="3"
        cx={100}
        fill="rgba(139,92,246,0.9)"
        filter="url(#beam-glow)"
        initial={{ cy: 8, opacity: 0 }}
        animate={{ cy: [8, 112, 8], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Upward travelling dot */}
      <motion.circle
        r="2.5"
        cx={100}
        fill="rgba(251,191,36,0.9)"
        filter="url(#beam-glow)"
        initial={{ cy: 112, opacity: 0 }}
        animate={{ cy: [112, 8, 112], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
      />
    </svg>
  )
}

/* ─── Profile Side ───────────────────────────────────────────────────────── */
function ProfileSide({
  profile,
  side,
  delay = 0,
}: {
  profile:  SwapProfile
  side:     'left' | 'right'
  delay?:   number
}) {
  const initials = profile.initials ?? profile.name.slice(0, 2).toUpperCase()
  const gradient = AVATAR_GRADIENTS[(profile.colorIndex ?? 0) % AVATAR_GRADIENTS.length]
  const icon     = LEVEL_ICONS[profile.level]

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-4 w-36 sm:w-44"
    >
      {/* Avatar */}
      <motion.div
        className="relative"
        animate={{
          filter: [
            'drop-shadow(0 0 10px rgba(139,92,246,0.30))',
            'drop-shadow(0 0 22px rgba(139,92,246,0.55))',
            'drop-shadow(0 0 10px rgba(139,92,246,0.30))',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
          style={{
            background: gradient,
            boxShadow:  '0 0 0 2px rgba(255,255,255,0.08)',
          }}
          aria-hidden="true"
        >
          {initials}
        </div>
        {/* Online pulse */}
        <span
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
          style={{
            background:   '#22C55E',
            borderColor:  '#07090D',
            boxShadow:    '0 0 8px rgba(34,197,94,0.7)',
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Name */}
      <div className="text-center">
        <p className="text-sm font-bold text-text-primary">{profile.name}</p>
      </div>

      {/* Skill card */}
      <div
        className="w-full rounded-xl px-4 py-3 text-center"
        style={{
          background:  'rgba(139,92,246,0.09)',
          border:      '1px solid rgba(139,92,246,0.22)',
          boxShadow:   '0 0 16px rgba(139,92,246,0.10)',
        }}
      >
        <p className="text-2xs uppercase tracking-widest text-text-muted font-semibold mb-1.5">
          Offers
        </p>
        <p className="text-sm font-bold text-purple-300">{profile.skill}</p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <span aria-hidden="true">{icon}</span>
          <span className="text-2xs text-text-muted font-medium capitalize">{profile.level}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function PerfectSwap({
  you,
  them,
  matchPercent,
  duration = '60 MIN',
  className = '',
  onAccept,
  onDecline,
}: PerfectSwapProps) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background:      '#11151D',
        border:          '1px solid rgba(255,255,255,0.08)',
        backgroundImage: 'linear-gradient(160deg, rgba(139,92,246,0.07) 0%, transparent 50%, rgba(251,191,36,0.04) 100%)',
      }}
    >
      {/* Top ambient glow */}
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-6 sm:p-8">

        {/* ── Match badge ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-7"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border:     '1px solid rgba(139,92,246,0.35)',
              boxShadow:  '0 0 20px rgba(139,92,246,0.20)',
            }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              aria-hidden="true"
            />
            <span
              className="text-sm font-bold"
              style={{
                background: 'linear-gradient(90deg, #C9AAFF, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {matchPercent}% Match
            </span>
          </div>
        </motion.div>

        {/* ── Three-column layout ───────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">

          <ProfileSide profile={you}  side="left"  delay={0.1} />

          {/* Center — animated beam + swap info */}
          <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
            {/* Swap arrows */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col items-center gap-1"
            >
              <SwapArrows />
            </motion.div>

            {/* Beam container */}
            <div className="relative w-8 flex-1 min-h-[80px] flex items-center justify-center">
              <ConnectionBeam />
            </div>

            {/* Duration pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.3 }}
            >
              <div
                className="px-3 py-1.5 rounded-xl text-center"
                style={{
                  background: 'rgba(251,191,36,0.10)',
                  border:     '1px solid rgba(251,191,36,0.25)',
                }}
              >
                <p className="text-2xs uppercase tracking-widest text-yellow-300/70 font-semibold">
                  Session
                </p>
                <p className="text-sm font-bold text-gold-400 mt-0.5">{duration}</p>
              </div>
            </motion.div>
          </div>

          <ProfileSide profile={them} side="right" delay={0.15} />
        </div>

        {/* ── Action buttons ────────────────────────────────────────── */}
        {(onAccept || onDecline) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="flex gap-3 mt-7"
          >
            {onDecline && (
              <button
                onClick={onDecline}
                className="flex-1 h-10 rounded-xl text-sm font-medium text-text-secondary
                           border border-border hover:bg-white/[0.04] hover:text-text-primary
                           transition-all duration-200"
              >
                Pass
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                className="flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  color:      '#07090D',
                  boxShadow:  '0 0 16px rgba(251,191,36,0.30)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(251,191,36,0.50)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(251,191,36,0.30)'
                }}
              >
                Accept Swap →
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Swap arrows icon ───────────────────────────────────────────────────── */
function SwapArrows() {
  return (
    <motion.svg
      width="28" height="28" viewBox="0 0 28 28" fill="none"
      animate={{ rotate: [0, 180, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <path d="M14 4 L14 10 M14 4 L11 7 M14 4 L17 7"
        stroke="rgba(139,92,246,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 24 L14 18 M14 24 L11 21 M14 24 L17 21"
        stroke="rgba(251,191,36,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}
