import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  children:  ReactNode
  loading?:  boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const sizeMap: Record<ButtonSize, string> = {
  sm: 'h-8  px-3.5 text-xs  gap-1.5 rounded-lg',
  md: 'h-10 px-5   text-sm  gap-2   rounded-xl',
  lg: 'h-12 px-7   text-base gap-2.5 rounded-xl',
}

const variantMap: Record<ButtonVariant, string> = {
  primary: `
    font-semibold text-[#07090D] bg-gold-400
    hover:bg-gold-300 active:bg-gold-500
    shadow-gold-sm hover:shadow-gold-md
  `,
  secondary: `
    font-medium text-text-primary border border-border
    bg-card hover:bg-card-elevated hover:border-[rgba(255,255,255,0.14)]
    active:bg-card
  `,
  ghost: `
    font-medium text-text-secondary hover:text-text-primary
    hover:bg-white/[0.05] active:bg-white/[0.03]
  `,
  danger: `
    font-semibold text-white
    border border-red-500/30 bg-red-500/10
    hover:bg-red-500/20 hover:border-red-500/50
  `,
}

export function Button({
  variant   = 'secondary',
  size      = 'md',
  children,
  loading   = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled  ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center
        transition-all duration-200 ease-smooth
        select-none shrink-0
        ${sizeMap[size]}
        ${variantMap[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
      <span className={`flex items-center gap-inherit ${loading ? 'opacity-0' : ''}`}
            style={{ gap: 'inherit' }}>
        {iconLeft  && <span className="shrink-0" aria-hidden="true">{iconLeft}</span>}
        {children}
        {iconRight && <span className="shrink-0" aria-hidden="true">{iconRight}</span>}
      </span>
    </motion.button>
  )
}

/* ── Primary CTA with arrow — the signature call-to-action ─────────────── */
export function CTAButton({
  children,
  className = '',
  ...rest
}: Omit<ButtonProps, 'variant' | 'iconRight'>) {
  return (
    <Button
      variant="primary"
      size="lg"
      iconRight={<ArrowRight />}
      className={`tracking-wide font-bold ${className}`}
      {...rest}
    >
      {children}
    </Button>
  )
}

/* ── Icon-only button ──────────────────────────────────────────────────── */
interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string
  size?: ButtonSize
  variant?: 'secondary' | 'ghost'
  children: ReactNode
}

export function IconButton({
  label,
  size = 'md',
  variant = 'ghost',
  children,
  className = '',
  ...rest
}: IconButtonProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 rounded-lg' : size === 'lg' ? 'w-12 h-12 rounded-xl' : 'w-10 h-10 rounded-xl'

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={label}
      className={`
        flex items-center justify-center shrink-0
        transition-all duration-200
        ${sizeClass}
        ${variant === 'secondary'
          ? 'border border-border bg-card hover:bg-card-elevated hover:border-border-strong text-text-secondary hover:text-text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.05]'
        }
        ${className}
      `}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/* ── Small helpers ──────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
