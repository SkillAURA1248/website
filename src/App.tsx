import { Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'

import LandingPage    from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'
import AuthPage       from './pages/AuthPage'
import DiscoverPage   from './pages/DiscoverPage'
import SkillDNAPage   from './pages/SkillDNAPage'
import MatchPage      from './pages/MatchPage'
import MessagesPage   from './pages/MessagesPage'
import ProfilePage    from './pages/ProfilePage'
import SettingsPage   from './pages/SettingsPage'
import DesignSystem   from './pages/DesignSystem'
import NotFoundPage   from './pages/NotFoundPage'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#07090D', minHeight: '100vh' }}
          className="flex flex-col items-center justify-center px-6 text-center gap-6">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-sm text-white/40 max-w-sm">{(this.state.error as Error).message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            className="px-6 py-3 rounded-xl text-sm font-bold text-[#07090D]"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
            ← Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/** Redirects to /auth if not signed in, preserving the intended destination */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{ background: '#07090D', minHeight: '100vh' }}
        className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="9" stroke="rgba(139,92,246,0.3)" strokeWidth="2"/>
              <path d="M12 3a9 9 0 0 1 9 9" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm text-white/30">Loading…</span>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    // Save where user was trying to go so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<LandingPage />} />
            <Route path="/auth"          element={<AuthPage />} />
            <Route path="/onboarding"    element={<OnboardingPage />} />

            {/* Protected — must be signed in */}
            <Route path="/discover"      element={<RequireAuth><DiscoverPage /></RequireAuth>} />
            <Route path="/skill-dna"     element={<RequireAuth><SkillDNAPage /></RequireAuth>} />
            <Route path="/match/:id"     element={<RequireAuth><MatchPage /></RequireAuth>} />
            <Route path="/messages"      element={<RequireAuth><MessagesPage /></RequireAuth>} />
            <Route path="/profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/profile/:id"   element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/settings"      element={<RequireAuth><SettingsPage /></RequireAuth>} />

            {/* Dev */}
            <Route path="/design-system" element={<DesignSystem />} />

            {/* 404 */}
            <Route path="*"              element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
