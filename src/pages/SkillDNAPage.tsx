import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, BookOpen, GraduationCap, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { SkillDNA, type SkillNode } from '../components/ui/SkillDNA'
import { SkillPill } from '../components/ui/SkillPill'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { upsertUserSkills } from '../lib/data'

const SUGGEST = [
  'Figma','React','Photography','Guitar','Python','Illustrator',
  'Spanish','Marketing','Video Editing','TypeScript','Notion','Piano',
]

export default function SkillDNAPage() {
  const { profile, profileId, reload } = useAuth()

  const [teachSkills, setTeachSkills] = useState(profile?.teachSkills ?? [])
  const [learnSkills, setLearnSkills] = useState(profile?.learnSkills ?? [])
  const [addingKind,  setAddingKind]  = useState<'teach' | 'learn' | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  const nodes: SkillNode[] = [
    ...teachSkills.map((s, i) => ({
      id: `teach-${i}`, label: s.skillName, kind: 'teach' as const,
      level: s.level as any,
      angle: (i * (180 / Math.max(teachSkills.length, 1))) - 90 + 10, dist: 0.78,
    })),
    ...learnSkills.map((s, i) => ({
      id: `learn-${i}`, label: s.skillName, kind: 'learn' as const,
      angle: (i * (180 / Math.max(learnSkills.length, 1))) + 100, dist: 0.78,
    })),
  ]

  const addTeach = (name: string) => {
    if (!teachSkills.find(s => s.skillName === name))
      setTeachSkills(p => [...p, { skillId: `tmp-${name}`, skillName: name, kind: 'teach', level: 'intermediate' }])
    setAddingKind(null)
  }

  const addLearn = (name: string) => {
    if (!learnSkills.find(s => s.skillName === name))
      setLearnSkills(p => [...p, { skillId: `tmp-${name}`, skillName: name, kind: 'learn' }])
    setAddingKind(null)
  }

  const handleSave = async () => {
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

  return (
    <Layout>
      <div className="px-4 md:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Your Skill DNA</h1>
          <p className="text-white/40 mt-2">Your knowledge as a network. Hover nodes to explore.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* DNA viz */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="flex-1 flex justify-center">
            <div className="rounded-2xl p-6 border" style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
              <SkillDNA nodes={nodes} centerLabel={profile?.displayName.split(' ')[0].toUpperCase() ?? 'YOU'} size={400} animated />
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-6">

            {/* Teach */}
            <div className="rounded-2xl p-5 border" style={{ background: '#11151D', borderColor: 'rgba(139,92,246,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-purple-400" />
                  <span className="text-sm font-bold text-white">I Can Teach</span>
                </div>
                <button onClick={() => setAddingKind(addingKind === 'teach' ? null : 'teach')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-all">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {teachSkills.map(s => (
                  <div key={s.skillId} className="flex items-center gap-1">
                    <SkillPill skill={s.skillName} level={s.level} selected />
                    <button onClick={() => setTeachSkills(p => p.filter(x => x.skillId !== s.skillId))}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {teachSkills.length === 0 && <p className="text-xs text-white/30">No teaching skills yet.</p>}
              </div>
              {addingKind === 'teach' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex flex-wrap gap-2">
                  {SUGGEST.filter(s => !teachSkills.find(ts => ts.skillName === s)).map(s => (
                    <button key={s} onClick={() => addTeach(s)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-white/60 border border-white/10 hover:border-purple-500/40 hover:text-purple-300 transition-all">
                      + {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Learn */}
            <div className="rounded-2xl p-5 border" style={{ background: '#11151D', borderColor: 'rgba(251,191,36,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-400" />
                  <span className="text-sm font-bold text-white">I Want to Learn</span>
                </div>
                <button onClick={() => setAddingKind(addingKind === 'learn' ? null : 'learn')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-all">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {learnSkills.map(s => (
                  <div key={s.skillId} className="flex items-center gap-1">
                    <SkillPill skill={s.skillName} />
                    <button onClick={() => setLearnSkills(p => p.filter(x => x.skillId !== s.skillId))}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {learnSkills.length === 0 && <p className="text-xs text-white/30">No learning goals yet.</p>}
              </div>
              {addingKind === 'learn' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex flex-wrap gap-2">
                  {SUGGEST.filter(s => !learnSkills.find(ls => ls.skillName === s)).map(s => (
                    <button key={s} onClick={() => addLearn(s)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-white/60 border border-white/10 hover:border-amber-500/40 hover:text-amber-300 transition-all">
                      + {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Teaching', value: teachSkills.length, color: '#8B5CF6' },
                { label: 'Learning', value: learnSkills.length, color: '#FBBF24' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-4 border text-center"
                  style={{ background: '#151A24', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <Button variant="primary" fullWidth onClick={handleSave} loading={saving}
              iconLeft={saved && !saving ? <span>✓</span> : undefined}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
