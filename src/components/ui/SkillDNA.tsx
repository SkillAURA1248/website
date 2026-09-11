import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type NodeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type NodeKind  = 'teach' | 'learn' | 'center'

export interface SkillNode {
  id:       string
  label:    string
  kind:     NodeKind
  level?:   NodeLevel
  /** angle in degrees from center (0 = right) */
  angle?:   number
  /** distance from center as 0–1 fraction of radius */
  dist?:    number
}

interface SkillDNAProps {
  nodes?:      SkillNode[]
  centerLabel?: string
  className?:  string
  size?:       number          // canvas size in px (square)
  animated?:   boolean
}

/* ─── Default demo data ──────────────────────────────────────────────────── */
const DEFAULT_NODES: SkillNode[] = [
  { id: 'figma',       label: 'Figma',       kind: 'teach', level: 'expert',       angle: 330, dist: 0.78 },
  { id: 'ui',          label: 'UI Design',   kind: 'teach', level: 'advanced',     angle: 30,  dist: 0.72 },
  { id: 'photo',       label: 'Photography', kind: 'teach', level: 'intermediate', angle: 100, dist: 0.80 },
  { id: 'html',        label: 'HTML / CSS',  kind: 'learn', level: 'beginner',     angle: 160, dist: 0.76 },
  { id: 'react',       label: 'React',       kind: 'learn', level: 'beginner',     angle: 210, dist: 0.74 },
  { id: 'motion',      label: 'Animation',   kind: 'learn', level: 'intermediate', angle: 265, dist: 0.80 },
]

/* ─── Level / kind meta ───────────────────────────────────────────────────── */
const KIND_COLOR: Record<NodeKind, { fill: string; glow: string; border: string }> = {
  center: { fill: '#8B5CF6',            glow: 'rgba(139,92,246,0.60)', border: 'rgba(139,92,246,0.9)'  },
  teach:  { fill: 'rgba(139,92,246,0.2)', glow: 'rgba(139,92,246,0.35)', border: 'rgba(139,92,246,0.65)' },
  learn:  { fill: 'rgba(251,191,36,0.15)', glow: 'rgba(251,191,36,0.30)', border: 'rgba(251,191,36,0.55)' },
}

const LEVEL_SIZE: Record<NodeLevel, number> = {
  expert: 18, advanced: 15, intermediate: 12, beginner: 10,
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function SkillDNA({
  nodes     = DEFAULT_NODES,
  centerLabel = 'YOU',
  className = '',
  size      = 400,
  animated  = true,
}: SkillDNAProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.82

  /* Convert angle+dist → SVG x,y */
  const toXY = (angle: number, dist: number) => {
    const rad = (angle - 90) * (Math.PI / 180)   // 0° = top
    return {
      x: cx + Math.cos(rad) * radius * dist,
      y: cy + Math.sin(rad) * radius * dist,
    }
  }

  const positioned = nodes.map((n, i) => {
    const angle = n.angle ?? (i * (360 / nodes.length))
    const dist  = n.dist  ?? 0.78
    return { ...n, ...toXY(angle, dist) }
  })

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, maxWidth: '100%' }}
      role="img"
      aria-label="Skill DNA network diagram"
    >
      {/* ── SVG lines layer ─────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <defs>
          {/* Purple line gradient */}
          <linearGradient id="line-grad-teach" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#8B5CF6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
          </linearGradient>
          {/* Gold line gradient */}
          <linearGradient id="line-grad-learn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FBBF24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.15" />
          </linearGradient>
          {/* Center glow filter */}
          <filter id="center-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Faint orbit ring */}
        <circle
          cx={cx} cy={cy} r={radius * 0.82}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* Connection lines */}
        {positioned.map((n, i) => (
          <motion.line
            key={n.id}
            x1={cx} y1={cy}
            x2={n.x} y2={n.y}
            stroke={n.kind === 'teach' ? '#8B5CF6' : '#FBBF24'}
            strokeWidth={hovered === n.id ? 2 : 1.2}
            strokeOpacity={hovered === n.id ? 0.9 : hovered ? 0.2 : 0.45}
            strokeDasharray="5 4"
            strokeLinecap="round"
            filter={hovered === n.id ? 'url(#node-glow)' : undefined}
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
              opacity:    { duration: 0.4, delay: i * 0.1 },
            }}
            style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
          />
        ))}
      </svg>

      {/* ── Center node ─────────────────────────────────────────────── */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full z-20 select-none"
        style={{
          width: 56, height: 56,
          left: cx - 28, top: cy - 28,
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.10) 100%)',
          border: '1.5px solid rgba(139,92,246,0.75)',
          boxShadow: '0 0 32px rgba(139,92,246,0.45), 0 0 8px rgba(139,92,246,0.60)',
        }}
        animate={animated ? {
          boxShadow: [
            '0 0 24px rgba(139,92,246,0.40), 0 0 6px rgba(139,92,246,0.55)',
            '0 0 44px rgba(139,92,246,0.65), 0 0 12px rgba(139,92,246,0.80)',
            '0 0 24px rgba(139,92,246,0.40), 0 0 6px rgba(139,92,246,0.55)',
          ],
        } : {}}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        aria-label={`Center: ${centerLabel}`}
      >
        <span className="text-xs font-bold text-purple-300 tracking-widest">{centerLabel}</span>
      </motion.div>

      {/* ── Skill nodes ─────────────────────────────────────────────── */}
      {positioned.map((n, i) => {
        const meta      = KIND_COLOR[n.kind]
        const nodeSize  = n.level ? LEVEL_SIZE[n.level] * 2 : 24
        const isHovered = hovered === n.id

        return (
          <motion.div
            key={n.id}
            className="absolute z-10 cursor-pointer"
            style={{ left: n.x - nodeSize / 2, top: n.y - nodeSize / 2 }}
            initial={animated ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.3 + i * 0.08 }}
            onHoverStart={() => setHovered(n.id)}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Node circle */}
            <motion.div
              className="rounded-full flex items-center justify-center"
              style={{
                width: nodeSize, height: nodeSize,
                background: meta.fill,
                border: `1.5px solid ${meta.border}`,
                boxShadow: isHovered ? `0 0 20px ${meta.glow}` : `0 0 8px ${meta.glow}55`,
              }}
              animate={animated ? {
                boxShadow: [
                  `0 0 6px ${meta.glow}44`,
                  `0 0 14px ${meta.glow}88`,
                  `0 0 6px ${meta.glow}44`,
                ],
              } : {}}
              transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />

            {/* Floating label */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  className="absolute z-30 pointer-events-none"
                  style={{
                    bottom: nodeSize + 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: '#151A24',
                      border: `1px solid ${meta.border}`,
                      color: n.kind === 'teach' ? '#C9AAFF' : '#FCD34D',
                      boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 8px ${meta.glow}44`,
                    }}
                  >
                    {n.label}
                    <span
                      className="ml-1.5 text-2xs font-normal opacity-70"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {n.kind === 'teach' ? '· teaches' : '· learning'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Always-visible mini-label for larger nodes */}
            {!isHovered && nodeSize >= 30 && (
              <div
                className="absolute text-center pointer-events-none select-none"
                style={{
                  top: nodeSize + 5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: n.kind === 'teach' ? 'rgba(169,126,255,0.75)' : 'rgba(251,191,36,0.65)',
                }}
              >
                {n.label}
              </div>
            )}
          </motion.div>
        )
      })}

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4"
        aria-label="Legend"
      >
        <LegendItem color="#8B5CF6" label="Teaches" />
        <LegendItem color="#FBBF24" label="Learning" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs text-text-muted font-medium">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
