import type { ReactNode, ElementType } from 'react'

/* ─── Type scale map ─────────────────────────────────────────────────────── */
type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
type TextVariant  = 'lead' | 'body' | 'small' | 'muted' | 'label' | 'mono'

const HEADING_CLASSES: Record<HeadingLevel, string> = {
  display: 'text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-text-primary',
  h1:      'text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-text-primary',
  h2:      'text-3xl font-bold tracking-tight leading-tight text-text-primary',
  h3:      'text-2xl font-bold tracking-tight text-text-primary',
  h4:      'text-xl font-semibold text-text-primary',
  h5:      'text-base font-semibold text-text-primary',
}

const TEXT_CLASSES: Record<TextVariant, string> = {
  lead:  'text-lg text-text-secondary leading-relaxed',
  body:  'text-base text-text-secondary leading-7',
  small: 'text-sm text-text-secondary leading-relaxed',
  muted: 'text-sm text-text-muted',
  label: 'text-2xs font-semibold uppercase tracking-widest text-text-muted',
  mono:  'font-mono text-sm text-purple-300 bg-purple-faint px-1.5 py-0.5 rounded',
}

/* ─── Heading ────────────────────────────────────────────────────────────── */
interface HeadingProps {
  level?:     HeadingLevel
  as?:        ElementType
  children:   ReactNode
  gradient?:  boolean          // purple→gold gradient text
  className?: string
}

export function Heading({
  level     = 'h2',
  as,
  children,
  gradient  = false,
  className = '',
}: HeadingProps) {
  const Tag = as ?? (
    level === 'display' || level === 'h1' ? 'h1'
    : level === 'h2' ? 'h2'
    : level === 'h3' ? 'h3'
    : level === 'h4' ? 'h4'
    : 'h5'
  ) as ElementType

  return (
    <Tag
      className={`${HEADING_CLASSES[level]} ${className}`}
      style={gradient ? {
        background: 'linear-gradient(135deg, #F4F6FA 0%, #C9AAFF 50%, #FBBF24 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor:  'transparent',
        backgroundClip:       'text',
      } : undefined}
    >
      {children}
    </Tag>
  )
}

/* ─── Text ───────────────────────────────────────────────────────────────── */
interface TextProps {
  variant?:   TextVariant
  as?:        ElementType
  children:   ReactNode
  className?: string
}

export function Text({
  variant   = 'body',
  as:       Tag = 'p',
  children,
  className = '',
}: TextProps) {
  return (
    <Tag className={`${TEXT_CLASSES[variant]} ${className}`}>
      {children}
    </Tag>
  )
}

/* ─── Gradient highlight span ────────────────────────────────────────────── */
interface HighlightProps {
  children:   ReactNode
  color?:     'purple' | 'gold' | 'both'
  className?: string
}

export function Highlight({ children, color = 'purple', className = '' }: HighlightProps) {
  const gradients = {
    purple: 'linear-gradient(135deg, #C9AAFF 0%, #8B5CF6 100%)',
    gold:   'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)',
    both:   'linear-gradient(90deg, #8B5CF6 0%, #FBBF24 100%)',
  }
  return (
    <span
      className={className}
      style={{
        background:           gradients[color],
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor:  'transparent',
        backgroundClip:       'text',
      }}
    >
      {children}
    </span>
  )
}

/* ─── Section header — label + heading + optional subtext ───────────────── */
interface SectionHeaderProps {
  label?:     string
  title:      ReactNode
  subtitle?:  string
  centered?:  boolean
  className?: string
}

export function SectionHeader({
  label,
  title,
  subtitle,
  centered  = false,
  className = '',
}: SectionHeaderProps) {
  const align = centered ? 'items-center text-center' : 'items-start'
  return (
    <div className={`flex flex-col gap-2 ${align} ${className}`}>
      {label && <Text variant="label">{label}</Text>}
      <Heading level="h2">{title}</Heading>
      {subtitle && <Text variant="lead" className="max-w-2xl">{subtitle}</Text>}
    </div>
  )
}

/* ─── Inline code / mono ─────────────────────────────────────────────────── */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code
      className="font-mono text-sm text-purple-300 px-1.5 py-0.5 rounded-md"
      style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.18)' }}
    >
      {children}
    </code>
  )
}

/* ─── Keyboard shortcut badge ────────────────────────────────────────────── */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium text-text-secondary"
      style={{
        background:  'rgba(255,255,255,0.06)',
        border:      '1px solid rgba(255,255,255,0.12)',
        boxShadow:   '0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </kbd>
  )
}

/* ─── Quote / callout ────────────────────────────────────────────────────── */
export function Callout({
  children,
  icon,
  variant = 'purple',
}: {
  children: ReactNode
  icon?:    ReactNode
  variant?: 'purple' | 'gold' | 'neutral'
}) {
  const styles = {
    purple:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)', accent: '#8B5CF6' },
    gold:    { bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.22)', accent: '#FBBF24' },
    neutral: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)', accent: '#525C6A' },
  }
  const s = styles[variant]

  return (
    <div
      className="flex gap-3 rounded-xl px-4 py-3.5"
      style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.accent}` }}
    >
      {icon && <span className="shrink-0 mt-0.5" aria-hidden="true">{icon}</span>}
      <Text variant="small" className="!text-text-secondary">{children}</Text>
    </div>
  )
}
