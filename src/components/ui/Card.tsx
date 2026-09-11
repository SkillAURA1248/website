import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import type { BadgeStatus } from './StatusBadge'
import { StatusBadge as _SB } from './StatusBadge'

/* Re-export dot variant as StatusDot for convenience */
export function StatusDot({ status }: { status: BadgeStatus }) {
  return <_SB status={status} variant="dot" />
}

/* ─── Base Card ──────────────────────────────────────────────────────────── */
interface CardProps extends HTMLMotionProps<'div'> {
  children:   ReactNode
  elevated?:  boolean
  hoverable?: boolean
  glow?:      boolean
  className?: string
  padding?:   'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

export function Card({
  children,
  elevated  = false,
  hoverable = false,
  glow      = false,
  className = '',
  padding   = 'md',
  ...rest
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`
        relative rounded-xl border overflow-hidden
        transition-all duration-300
        ${elevated ? 'bg-card-elevated shadow-card-elevated' : 'bg-card shadow-card'}
        ${glow ? 'hover:shadow-purple-sm hover:border-purple-400/25' : ''}
        ${hoverable ? 'cursor-pointer' : ''}
        ${paddingMap[padding]}
        ${className}
      `}
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundImage: elevated
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 55%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
        ...((rest as { style?: React.CSSProperties }).style),
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/* ─── Match / Profile Card ───────────────────────────────────────────────── */
interface MatchCardProps {
  name:          string
  skills:        string[]
  wantsToLearn:  string[]
  matchPercent:  number
  status?:       BadgeStatus
  onViewSwap?:   () => void
  initials?:     string
  gradientIndex?: number
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
]

export function MatchCard({
  name,
  skills,
  wantsToLearn,
  matchPercent,
  status = 'online',
  onViewSwap,
  initials,
  gradientIndex = 0,
}: MatchCardProps) {
  const avatarGradient = AVATAR_GRADIENTS[gradientIndex % AVATAR_GRADIENTS.length]
  const displayInitials = initials ?? name.slice(0, 2).toUpperCase()

  return (
    <Card hoverable glow elevated padding="none" className="min-w-[240px] flex flex-col">
      {/* Top strip */}
      <div className="px-5 pt-5 pb-4">
        {/* Match % */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-2xs font-bold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(90deg, #8B5CF6, #A97EFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {matchPercent}% Match
          </span>
          <StatusDot status={status} />
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{
              background: avatarGradient,
              boxShadow: '0 0 0 2px rgba(255,255,255,0.07)',
            }}
          >
            {displayInitials}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-tight">{name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {skills.map(s => (
                <span key={s} className="text-2xs text-text-secondary font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Wants to learn */}
        <div>
          <p className="text-2xs uppercase tracking-widest text-text-muted font-semibold mb-2">
            Wants to learn
          </p>
          <div className="flex flex-wrap gap-1.5">
            {wantsToLearn.map(s => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-md font-medium text-purple-300"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        className="px-5 py-3 mt-auto flex items-center justify-end border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onViewSwap}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300
                     flex items-center gap-1.5 transition-colors duration-150 group"
        >
          View Swap
          <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </Card>
  )
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
interface StatCardProps {
  label:     string
  value:     string | number
  change?:   string
  positive?: boolean
  icon?:     ReactNode
}

export function StatCard({ label, value, change, positive = true, icon }: StatCardProps) {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-2xs uppercase tracking-widest font-semibold text-text-muted">{label}</p>
        {icon && (
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-400"
                style={{ background: 'rgba(139,92,246,0.10)' }}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-text-primary leading-none">
          {value}
        </span>
        {change && (
          <span className={`text-xs font-semibold mb-0.5 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </Card>
  )
}

/* ─── StatusDot re-exported from StatusBadge ────────────────────────────── */
// (defined above as a convenience wrapper)
