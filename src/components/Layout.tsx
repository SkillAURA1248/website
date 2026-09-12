import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useAuth } from '../lib/auth'

const NAV_LINKS = [
  { label: 'Discover',  href: '/discover'  },
  { label: 'My Skills', href: '/settings'  },
  { label: 'Skill DNA', href: '/skill-dna' },
  { label: 'Messages',  href: '/messages'  },
]

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const active = location.pathname

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ background: '#07090D' }}>
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-14"
        style={{
          background: 'rgba(7,9,13,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.jpeg" alt="SkillSwap" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-base font-bold tracking-tight text-white">
              Skill<span className="text-purple-400">Swap</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = active === href || active.startsWith(href + '/')
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className="relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.5)' }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'rgba(139,92,246,0.12)',
                        boxShadow: '0 0 0 1px rgba(139,92,246,0.22)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/messages')}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a4 4 0 0 0-4 4v2l-1 2h10l-1-2V6a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
                <path d="M6.5 12a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)' }}
              >
                {(profile?.displayName ?? 'U').slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden lg:block text-sm font-medium text-white/50 group-hover:text-white transition-colors">
                {profile?.displayName?.split(' ')[0] ?? 'Profile'}
              </span>
            </button>

            {/* Mobile toggle */}
            <button
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen
                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden absolute top-14 inset-x-0 py-2 border-b"
              style={{
                background: 'rgba(7,9,13,0.95)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              {NAV_LINKS.map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => { navigate(href); setMobileOpen(false) }}
                  className="w-full text-left px-6 py-3 text-sm font-medium transition-colors"
                  style={{
                    color: active === href ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                    background: active === href ? 'rgba(139,92,246,0.08)' : 'transparent',
                  }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => { navigate('/profile'); setMobileOpen(false) }}
                className="w-full text-left px-6 py-3 text-sm font-medium text-white/50"
              >
                Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ───────────────────────────────────────────── */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
