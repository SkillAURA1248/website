import type { ReactNode } from 'react'

export type BadgeStatus = 'online' | 'available' | 'upcoming' | 'completed' | 'pending' | 'offline'
export type BadgeVariant = 'dot' | 'pill' | 'tag'

const STATUS_CONFIG: Record<BadgeStatus, {
  label:  string
  color:  string
  bg:     string
  border: string
}> = {
  online:    { label: 'Online',    color: '#22C55E', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)'   },
  available: { label: 'Available', color: '#34D399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)'  },
  upcoming:  { label: 'Upcoming',  color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.25)'  },
  completed: { label: 'Completed', color: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)' },
  pending:   { label: 'Pending',   color: '#FBBF24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)'  },
  offline:   { label: 'Offline',   color: '#6B7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.20)' },
}

interface StatusBadgeProps {
  status:    BadgeStatus
  variant?:  BadgeVariant
  label?:    string         // override displayed label
  animate?:  boolean        // pulse dot animation
}

export function StatusBadge({
  status,
  variant = 'pill',
  label,
  animate = true,
}: StatusBadgeProps) {
  const cfg         = STATUS_CONFIG[status]
  const displayText = label ?? cfg.label

  if (variant === 'dot') {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${animate && status === 'online' ? 'animate-glow-pulse' : ''}`}
        style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}88` }}
        aria-label={displayText}
        role="status"
      />
    )
  }

  if (variant === 'pill') {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${animate && status === 'online' ? 'animate-glow-pulse' : ''}`}
          style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }}
          aria-hidden="true"
        />
        {displayText}
      </span>
    )
  }

  // variant === 'tag'
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {displayText}
    </span>
  )
}

/* ─── Status Row: dot + text side-by-side ────────────────────────────────── */
export function StatusRow({
  status,
  children,
}: {
  status: BadgeStatus
  children?: ReactNode
}) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}88` }}
        aria-hidden="true"
      />
      {children ?? cfg.label}
    </span>
  )
}

/* ─── Notification count badge ───────────────────────────────────────────── */
export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
  if (count <= 0) return null
  const display = count > max ? `${max}+` : String(count)

  return (
    <span
      className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem]
                 px-1 rounded-full text-[10px] font-bold text-white"
      style={{ background: '#8B5CF6', boxShadow: '0 0 8px rgba(139,92,246,0.5)' }}
      aria-label={`${count} notifications`}
    >
      {display}
    </span>
  )
}
