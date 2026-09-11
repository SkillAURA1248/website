import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { signIn, signUp } from '../lib/auth'

export default function AuthPage() {
  const [tab,       setTab]      = useState<'signin' | 'signup'>('signin')
  const [email,     setEmail]    = useState('')
  const [password,  setPassword] = useState('')
  const [name,      setName]     = useState('')
  const [username,  setUsername] = useState('')
  const [showPass,  setShowPass] = useState(false)
  const [isLoading, setLoading]  = useState(false)
  const [error,     setError]    = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from ?? '/discover'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    if (tab === 'signup' && !name.trim()) { setError('Please enter your full name.'); return }
    if (tab === 'signup' && !username.trim()) { setError('Please choose a username.'); return }

    setLoading(true)

    try {
      if (tab === 'signup') {
        const { user, error: err } = await signUp(email, password, name.trim(), username.trim())
        if (err)   { setError(err); return }
        if (user) { navigate('/onboarding'); return }
      } else {
        const { user, error: err } = await signIn(email, password)
        if (err)   { setError(err); return }
        if (user) { navigate(from); return }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all bg-[#0C1017]`
  const inputStyle = { border: '1px solid rgba(255,255,255,0.08)' }
  const focusStyle = 'rgba(139,92,246,0.4)'
  const blurStyle  = 'rgba(255,255,255,0.08)'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#07090D' }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(139,92,246,0.13) 0%,transparent 65%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2.5 mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="8"  cy="10" r="3.5" fill="#8B5CF6" fillOpacity="0.9" />
            <circle cx="16" cy="10" r="3.5" fill="#FBBF24" fillOpacity="0.9" />
            <path d="M11 10 L13 10" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
            <circle cx="12" cy="16" r="2" fill="#ffffff" fillOpacity="0.25" />
          </svg>
          <span className="text-2xl font-bold text-white">Skill<span className="text-purple-400">Swap</span></span>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-8 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: '#0C1017' }}>
            {(['signin', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(null) }}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                style={{
                  background: tab === t ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color:      tab === t ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                  border:     tab === t ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
                }}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <>
                <input type="text" placeholder="Full name" value={name}
                  onChange={e => setName(e.target.value)} className={inputCls} style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = focusStyle)}
                  onBlur={e =>  (e.currentTarget.style.borderColor = blurStyle)}
                  required />
                <input type="text" placeholder="Username" value={username}
                  onChange={e => setUsername(e.target.value)} className={inputCls} style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = focusStyle)}
                  onBlur={e =>  (e.currentTarget.style.borderColor = blurStyle)}
                  required />
              </>
            )}

            <input type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} className={inputCls} style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = focusStyle)}
              onBlur={e =>  (e.currentTarget.style.borderColor = blurStyle)}
              required />

            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = focusStyle)}
                onBlur={e =>  (e.currentTarget.style.borderColor = blurStyle)}
                required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3.5 text-white/30 hover:text-white/70 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-red-400 bg-red-900/20 px-3 py-2.5 rounded-xl border border-red-800/30">
                {error}
              </motion.div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}
              iconRight={!isLoading ? <ArrowRight size={16} /> : undefined}>
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/25">
            By continuing you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a> &{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 text-center">
          <button onClick={() => navigate('/')}
            className="text-sm text-white/30 hover:text-white/70 transition-colors flex items-center gap-2 mx-auto">
            <ArrowRight size={13} className="rotate-180" /> Back to home
          </button>
        </motion.div>
      </div>
    </div>
  )
}

