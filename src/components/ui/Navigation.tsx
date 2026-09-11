import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Discover',   href: '#discover'  },
  { label: 'My Skills',  href: '#my-skills' },
  { label: 'Skill DNA',  href: '#skill-dna' },
  { label: 'Messages',   href: '#messages'  },
  { label: 'Sessions',   href: '#sessions'  },
]

interface NavigationProps {
  activeLink?: string
  onLinkClick?: (href: string) => void
}

export function Navigation({ activeLink = '#discover', onLinkClick }: NavigationProps) {
  const [active, setActive] = useState(activeLink)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleClick = (href: string) => {
    setActive(href)
    setMobileOpen(false)
    onLinkClick?.(href)
  }

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-14 glass border-b border-border"
      style={{ borderBottomColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="ss-container h-full flex items-center justify-between gap-6">

        {/* ── Logo ───────────────────────────────────────────────── */}
        <a href="#" className="flex items-center gap-2.5 shrink-0 group">
          <LogoMark />
          <span className="text-base font-bold tracking-tight text-text-primary">
            Skill<span className="text-purple-400">Swap</span>
          </span>
        </a>

        {/* ── Desktop nav ────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = active === href
            return (
              <button
                key={href}
                onClick={() => handleClick(href)}
                className={`
                  relative px-3.5 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200 ease-smooth
                  ${isActive
                    ? 'text-purple-300'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'rgba(139,92,246,0.12)',
                      boxShadow: '0 0 0 1px rgba(139,92,246,0.22), 0 0 14px rgba(139,92,246,0.18)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </nav>

        {/* ── Right side ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification dot */}
          <button
            className="relative w-8 h-8 rounded-lg flex items-center justify-center
                       text-text-secondary hover:text-text-primary
                       hover:bg-white/[0.05] transition-colors duration-150"
            aria-label="Notifications"
          >
            <BellIcon />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-glow-pulse"
              aria-hidden="true"
            />
          </button>

          {/* Avatar */}
          <button className="flex items-center gap-2 group" aria-label="User profile">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                         transition-all duration-200 group-hover:shadow-purple-sm"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                boxShadow: '0 0 0 2px rgba(139,92,246,0.20)',
              }}
            >
              U
            </div>
            <span className="hidden lg:block text-sm font-medium text-text-secondary
                             group-hover:text-text-primary transition-colors duration-150">
              User
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center
                       text-text-secondary hover:text-text-primary hover:bg-white/[0.05]
                       transition-colors duration-150"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute top-14 inset-x-0 glass border-b border-border py-2"
          >
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = active === href
              return (
                <button
                  key={href}
                  onClick={() => handleClick(href)}
                  className={`
                    w-full text-left px-6 py-3 text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'text-purple-300 bg-purple-faint'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ── Icon primitives ──────────────────────────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="10" r="3.5" fill="#8B5CF6" fillOpacity="0.9" />
      <circle cx="16" cy="10" r="3.5" fill="#FBBF24" fillOpacity="0.9" />
      <path d="M11 10 L13 10" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
      <circle cx="12" cy="16" r="2" fill="#ffffff" fillOpacity="0.25" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2a4 4 0 0 0-4 4v2l-1 2h10l-1-2V6a4 4 0 0 0-4-4Z"
        stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M6.5 12a1.5 1.5 0 0 0 3 0"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
