import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

const LEVEL_META: Record<SkillLevel, { icon: string; label: string; color: string; bg: string; border: string }> = {
  beginner:     { icon: '🌱', label: 'Beginner',     color: '#34D399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.2)'  },
  intermediate: { icon: '⚡', label: 'Intermediate', color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.2)'  },
  advanced:     { icon: '🔥', label: 'Advanced',     color: '#FB923C', bg: 'rgba(251,146,60,0.08)',   border: 'rgba(251,146,60,0.2)'  },
  expert:       { icon: '◆',  label: 'Expert',       color: '#A97EFF', bg: 'rgba(169,126,255,0.12)',  border: 'rgba(169,126,255,0.3)' },
}

interface SkillPillProps {
  skill:      string
  level?:     SkillLevel
  selected?:  boolean
  onClick?:   () => void
  removable?: boolean
  onRemove?:  () => void
  size?:      'sm' | 'md'
}

export function SkillPill({
  skill,
  level,
  selected  = false,
  onClick,
  removable = false,
  onRemove,
  size      = 'md',
}: SkillPillProps) {
  const meta = level ? LEVEL_META[level] : null
  const isSm = size === 'sm'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 480, damping: 30 }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`
        inline-flex items-center gap-1.5 font-medium leading-none shrink-0
        transition-all duration-200 select-none
        ${isSm ? 'px-2.5 py-1 text-xs rounded-lg' : 'px-3 py-1.5 text-sm rounded-xl'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={
        selected
          ? {
              background:  'rgba(139,92,246,0.18)',
              border:      '1px solid rgba(139,92,246,0.40)',
              color:       '#C9AAFF',
              boxShadow:   '0 0 12px rgba(139,92,246,0.20)',
            }
          : {
              background:  meta?.bg  ?? 'rgba(255,255,255,0.06)',
              border:      `1px solid ${meta?.border ?? 'rgba(255,255,255,0.10)'}`,
              color:       meta?.color ?? '#8892A0',
            }
      }
    >
      {level && (
        <span className="text-base leading-none" aria-hidden="true" style={{ fontSize: isSm ? '0.7rem' : '0.85rem' }}>
          {meta!.icon}
        </span>
      )}

      <span>{skill}</span>

      {selected && !removable && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-glow-pulse"
          style={{ background: '#8B5CF6', boxShadow: '0 0 6px #8B5CF6' }}
          aria-hidden="true"
        />
      )}

      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          aria-label={`Remove ${skill}`}
          className="ml-0.5 hover:opacity-75 transition-opacity"
          style={{ color: meta?.color ?? '#8892A0' }}
        >
          <CloseXIcon size={isSm ? 10 : 12} />
        </button>
      )}
    </motion.div>
  )
}

/* ─── Skill Tag Group ────────────────────────────────────────────────────── */
interface SkillTagGroupProps {
  skills:       Array<{ name: string; level?: SkillLevel; selected?: boolean }>
  onToggle?:    (name: string) => void
  removable?:   boolean
  onRemove?:    (name: string) => void
  size?:        'sm' | 'md'
  className?:   string
}

export function SkillTagGroup({
  skills,
  onToggle,
  removable = false,
  onRemove,
  size = 'md',
  className = '',
}: SkillTagGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {skills.map(({ name, level, selected }) => (
        <SkillPill
          key={name}
          skill={name}
          level={level}
          selected={selected}
          onClick={onToggle ? () => onToggle(name) : undefined}
          removable={removable}
          onRemove={onRemove ? () => onRemove(name) : undefined}
          size={size}
        />
      ))}
    </div>
  )
}

/* ─── Level Badge (standalone) ───────────────────────────────────────────── */
export function LevelBadge({ level }: { level: SkillLevel }) {
  const meta = LEVEL_META[level]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold"
      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
    >
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  )
}

/* ─── Icon ───────────────────────────────────────────────────────────────── */
function CloseXIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
