import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface LockedFeatureProps {
  title:        string
  description:  string
  phase?:       string | number
  icon?:        ReactNode
  className?:   string
  /** If provided, renders an optional teaser action */
  onNotify?:    () => void
}

export function LockedFeature({
  title,
  description,
  phase,
  icon,
  className = '',
  onNotify,
}: LockedFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        background:  '#11151D',
        border:      '1px solid rgba(255,255,255,0.07)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)',
      }}
      aria-label={`${title} — locked feature`}
    >
      {/* Subtle purple ambient behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-10 gap-5">

        {/* Icon / Lock */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: 'rgba(139,92,246,0.10)',
            border:     '1px solid rgba(139,92,246,0.20)',
            boxShadow:  '0 0 20px rgba(139,92,246,0.12)',
          }}
          aria-hidden="true"
        >
          {icon ?? '🔒'}
        </motion.div>

        {/* Text */}
        <div className="flex flex-col gap-2 max-w-xs">
          <h3 className="text-base font-bold text-text-primary tracking-tight">{title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>

        {/* Phase label */}
        {phase !== undefined && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                       text-xs font-semibold text-purple-300"
            style={{
              background: 'rgba(139,92,246,0.10)',
              border:     '1px solid rgba(139,92,246,0.22)',
            }}
          >
            <span aria-hidden="true">◈</span>
            Available in Phase {phase}
          </span>
        )}

        {/* Optional notify CTA */}
        {onNotify && (
          <button
            onClick={onNotify}
            className="mt-1 text-xs font-medium text-text-muted hover:text-purple-300
                       transition-colors duration-150 underline underline-offset-2"
          >
            Notify me when available
          </button>
        )}
      </div>

      {/* Bottom scan line decoration */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
        }}
        aria-hidden="true"
      />
    </motion.div>
  )
}

/* ─── Compact inline locked placeholder ─────────────────────────────────── */
interface InlineLockedProps {
  label:     string
  className?: string
}

export function InlineLocked({ label, className = '' }: InlineLockedProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  text-xs font-medium text-text-muted ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      aria-label={`${label} — locked`}
    >
      <span aria-hidden="true">🔒</span>
      {label}
    </span>
  )
}
