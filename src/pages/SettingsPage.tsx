import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Check, Bell, Shield, User, Palette, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { SkillPill } from '../components/ui/SkillPill'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { getAllSkills, upsertUserSkills, updateProfile } from '../lib/data'
import type { Skill, SkillLevel } from '../lib/types'

const LEVELS: { value: SkillLevel; label: string; icon: string }[] = [
  { value: 'beginner',     label: 'Beginner',     icon: '🌱' },
  { value: 'intermediate', label: 'Intermediate', icon: '⚡' },
  { value: 'advanced',     label: 'Advanced',     icon: '🔥' },
  { value: 'expert',       label: 'Expert',       icon: '◆'  },
]

type Tab = 'skills' | 'profile' | 'notifications' | 'privacy'

export default function SettingsPage() {
  const { profile, profileId, reload } = useAuth()

  const [tab,         setTab]        = useState<Tab>('skills')
  const [allSkills,   setAllSkills]  = useState<Skill[]>([])
  const [teachSkills, setTeachSkills]= useState(profile?.teachSkills ?? [])
  const [learnSkills, setLearnSkills]= useState(profile?.learnSkills ?? [])
  const [displayName, setDisplayName]= useState(profile?.displayName ?? '')
  const [bio,         setBio]        = useState(profile?.bio ?? '')
  const [location,    setLocation]   = useState(profile?.location ?? '')
  const [saved,       setSaved]      = useState(false)
  const [saving,      setSaving]     = useState(false)
  const [addingTeach, setAddingTeach]= useState(false)
  const [addingLearn, setAddingLearn]= useState(false)
  const [notifs,      setNotifs]     = useState({
    newMatch: true, messages: true, swapRequests: true, sessionReminders: true, weeklyDigest: false,
  })

  useEffect(() => { getAllSkills().then(setAllSkills) }, [])

  useEffect(() => {
    if (profile) {
      setTeachSkills(profile.teachSkills)
      setLearnSkills(profile.learnSkills)
      setDisplayName(profile.displayName)
      setBio(profile.bio ?? '')
      setLocation(profile.location ?? '')
    }
  }, [profile])

  const handleSaveSkills = async () => {
    if (!profileId) return
    setSaving(true)
    const skills = [
      ...teachSkills.map(s => ({ skillId: s.skillId, kind: 'teach' as const, level: s.level })),
      ...learnSkills.map(s => ({ skillId: s.skillId, kind: 'learn' as const })),
    ]
    await upsertUserSkills(profileId, skills)
    await reload()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveProfile = async () => {
    if (!profileId) return
    setSaving(true)
    await updateProfile(profileId, { display_name: displayName, bio, location })
    await reload()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const setTeachLevel = (skillId: string, level: SkillLevel) =>
    setTeachSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, level } : s))

  const removeTeach = (skillId: string) => setTeachSkills(prev => prev.filter(s => s.skillId !== skillId))
  const removeLearn = (skillId: string) => setLearnSkills(prev => prev.filter(s => s.skillId !== skillId))

  const addTeach = (skill: Skill) => {
    if (!teachSkills.find(s => s.skillId === skill.id))
      setTeachSkills(prev => [...prev, { skillId: skill.id, skillName: skill.name, kind: 'teach', level: 'intermediate' }])
    setAddingTeach(false)
  }

  const addLearn = (skill: Skill) => {
    if (!learnSkills.find(s => s.skillId === skill.id))
      setLearnSkills(prev => [...prev, { skillId: skill.id, skillName: skill.name, kind: 'learn' }])
    setAddingLearn(false)
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'skills',        label: 'Skills',        icon: <Palette size={15} /> },
    { id: 'profile',       label: 'Profile',       icon: <User size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'privacy',       label: 'Privacy',       icon: <Shield size={15} /> },
  ]

  const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all`
  const inputStyle = { background: '#0C1017', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <Layout>
      <div className="px-4 md:px-6 py-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/40 mt-2">Manage your profile, skills, and preferences</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-52 shrink-0">
            <nav className="space-y-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: tab === t.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                    color:      tab === t.id ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                    border:     tab === t.id ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
                  }}>
                  {t.icon}{t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── SKILLS ──────────────────────────────────────────── */}
            {tab === 'skills' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Teaching */}
                <div className="rounded-2xl p-6 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-white">I Can Teach</h2>
                    <button onClick={() => setAddingTeach(v => !v)}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      <Plus size={14} /> Add skill
                    </button>
                  </div>
                  <div className="space-y-4">
                    {teachSkills.map(s => (
                      <div key={s.skillId} className="flex items-center gap-3 flex-wrap">
                        <SkillPill skill={s.skillName} selected size="sm" />
                        <div className="flex gap-1 flex-wrap">
                          {LEVELS.map(lv => (
                            <button key={lv.value} onClick={() => setTeachLevel(s.skillId, lv.value)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                              style={{
                                background: s.level === lv.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                                color:      s.level === lv.value ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
                                border:     s.level === lv.value ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(255,255,255,0.05)',
                              }}>
                              <span>{lv.icon}</span>
                              <span className="hidden sm:inline">{lv.label}</span>
                            </button>
                          ))}
                        </div>
                        <button onClick={() => removeTeach(s.skillId)} className="text-white/20 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {teachSkills.length === 0 && <p className="text-sm text-white/30">No teaching skills yet. Add some!</p>}
                  </div>
                  {addingTeach && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 flex flex-wrap gap-2">
                      {allSkills.filter(s => !teachSkills.find(ts => ts.skillId === s.id)).slice(0, 14).map(s => (
                        <button key={s.id} onClick={() => addTeach(s)}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white/50 border border-white/10 hover:border-purple-500/40 hover:text-purple-300 transition-all">
                          + {s.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Learning */}
                <div className="rounded-2xl p-6 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-white">I Want to Learn</h2>
                    <button onClick={() => setAddingLearn(v => !v)}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      <Plus size={14} /> Add skill
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {learnSkills.map(s => (
                      <div key={s.skillId} className="flex items-center gap-1">
                        <SkillPill skill={s.skillName} />
                        <button onClick={() => removeLearn(s.skillId)} className="text-white/20 hover:text-red-400 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {learnSkills.length === 0 && <p className="text-sm text-white/30">No learning goals yet.</p>}
                  </div>
                  {addingLearn && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 flex flex-wrap gap-2">
                      {allSkills.filter(s => !learnSkills.find(ls => ls.skillId === s.id)).slice(0, 14).map(s => (
                        <button key={s.id} onClick={() => addLearn(s)}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white/50 border border-white/10 hover:border-amber-500/40 hover:text-amber-300 transition-all">
                          + {s.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <Button variant="primary" onClick={handleSaveSkills} loading={saving}
                  iconLeft={saved && !saving ? <Check size={14} /> : undefined}>
                  {saved ? 'Saved!' : 'Save Skills'}
                </Button>
              </motion.div>
            )}

            {/* ── PROFILE ─────────────────────────────────────────── */}
            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="rounded-2xl p-6 border space-y-5" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h2 className="font-bold text-white">Profile Info</h2>
                  {[
                    { label: 'Display Name', value: displayName, set: setDisplayName, placeholder: 'Your full name' },
                    { label: 'Location',     value: location,    set: setLocation,    placeholder: 'City, Country' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">{f.label}</label>
                      <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                        className={inputCls} style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
                        onBlur={e =>  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself…"
                      rows={3} className={`${inputCls} resize-none`} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
                      onBlur={e =>  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')} />
                  </div>
                </div>
                <Button variant="primary" onClick={handleSaveProfile} loading={saving}
                  iconLeft={saved && !saving ? <Check size={14} /> : undefined}>
                  {saved ? 'Saved!' : 'Save Profile'}
                </Button>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS ────────────────────────────────────── */}
            {tab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <div className="rounded-2xl p-6 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h2 className="font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-5">
                    {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => {
                      const labels: Record<keyof typeof notifs, string> = {
                        newMatch: 'New match found', messages: 'New messages',
                        swapRequests: 'Swap requests', sessionReminders: 'Session reminders',
                        weeklyDigest: 'Weekly digest email',
                      }
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-white/70">{labels[key]}</span>
                          <button onClick={() => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))}
                            className="relative w-11 h-6 rounded-full transition-all duration-200"
                            style={{ background: val ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
                            <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                              style={{ left: val ? '1.5rem' : '0.25rem' }} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PRIVACY ──────────────────────────────────────────── */}
            {tab === 'privacy' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="rounded-2xl p-6 border space-y-5" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h2 className="font-bold text-white">Privacy & Security</h2>
                  {['Show my location publicly','Allow others to see my Skill DNA','Show online status','Allow direct messages from anyone'].map((label, i) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-white/70">{label}</span>
                      <button className="relative w-11 h-6 rounded-full transition-all duration-200"
                        style={{ background: i % 2 === 0 ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
                        <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                          style={{ left: i % 2 === 0 ? '1.5rem' : '0.25rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-6 border" style={{ background: '#11151D', borderColor: 'rgba(239,68,68,0.15)' }}>
                  <h3 className="font-bold text-white mb-4">Danger Zone</h3>
                  <button className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all">
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
