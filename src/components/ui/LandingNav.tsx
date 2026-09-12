import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Discover',  to: '/discover'   },
  { label: 'My Skills', to: '/settings'  },
  { label: 'Skill DNA', to: '/skill-dna'  },
  { label: 'Messages',  to: '/messages'   },
]

export function LandingNav() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const navigate = useNavigate()

  /* Thicken the border once the user scrolls past the hero */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-14 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(7,9,13,0.92)'
          : 'rgba(7,9,13,0.55)',
        backdropFilter:         'blur(18px)',
        WebkitBackdropFilter:   'blur(18px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div className="ss-container h-full flex items-center justify-between gap-6 px-4 md:px-6 lg:px-8">

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <LogoMark />
          <span className="text-base font-bold tracking-tight text-text-primary">
            Skill<span className="text-purple-400">AURA</span>
          </span>
        </Link>

        {/* ── Desktop links ──────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-text-secondary
                         hover:text-text-primary hover:bg-white/[0.05]
                         transition-all duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ──────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-text-secondary
                       hover:text-text-primary hover:bg-white/[0.05]
                       transition-all duration-200"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="px-4 py-1.5 rounded-lg text-sm font-bold text-[#07090D]
                       transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow:  '0 0 14px rgba(251,191,36,0.25)',
            }}
            onClick={() => navigate('/discover')}
          >
            Get Started
          </motion.button>
        </div>

        {/* ── Mobile toggle ──────────────────────────────────────────── */}
        <button
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center
                     text-text-secondary hover:text-text-primary hover:bg-white/[0.05]
                     transition-colors duration-150"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute top-14 inset-x-0 border-b py-2"
            style={{
              background: 'rgba(7,9,13,0.96)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="block w-full px-6 py-3 text-sm font-medium text-text-secondary
                           hover:text-text-primary hover:bg-white/[0.03] transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
            <div className="px-6 pt-2 pb-3 flex gap-2 border-t mt-2"
                 style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                className="flex-1 h-9 rounded-lg text-sm font-medium text-text-secondary
                           border border-border hover:bg-white/[0.04] transition-colors duration-150"
                onClick={() => { setMobileOpen(false); navigate('/auth') }}
              >
                Sign In
              </button>
              <button
                className="flex-1 h-9 rounded-lg text-sm font-bold text-[#07090D] transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}
                onClick={() => { setMobileOpen(false); navigate('/discover') }}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ── Icon primitives ──────────────────────────────────────────────────────── */
function LogoMark() {
  return <img src="/logo.jpeg" alt="SkillAURA" className="w-6 h-6 rounded-md object-contain" aria-hidden="true" />
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
