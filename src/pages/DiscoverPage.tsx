import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Star, MapPin, Sparkles, Shield, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { SkillPill } from '../components/ui/SkillPill'
import { Button } from '../components/ui/Button'
import { getMatches, getAllSkills } from '../lib/data'
import type { Match, Skill } from '../lib/types'

const GRADIENTS = [
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
]

function MatchCard({ match, delay = 0 }: { match: Match; delay?: number }) {
  const navigate = useNavigate()
  const { profile } = match
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/match/${match.id}`, { state: { match } })}
      className="cursor-pointer rounded-2xl p-5 border transition-all group"
      style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
        e.currentTarget.style.boxShadow   = '0 8px 32px rgba(139,92,246,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.displayName}
              className="w-10 h-10 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold text-white"
              style={{ background: GRADIENTS[profile.gradientIndex % 5] }}>
              {profile.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{profile.displayName}</span>
              {profile.isVerified && <Shield size={12} className="text-purple-400" />}
            </div>
            {profile.location && (
              <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                <MapPin size={10} />{profile.location}
              </div>
            )}
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
          {match.matchScore}%
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-1.5">Can teach you</div>
          <div className="flex flex-wrap gap-1.5">
            {match.sharedTeach.slice(0, 3).map(s => <SkillPill key={s} skill={s} selected size="sm" />)}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-1.5">Wants to learn</div>
          <div className="flex flex-wrap gap-1.5">
            {match.sharedLearn.slice(0, 3).map(s => <SkillPill key={s} skill={s} size="sm" />)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {profile.rating} · {profile.sessionsCompleted} sessions
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
          View Swap <ArrowRight size={12} />
        </div>
      </div>
    </motion.div>
  )
}

export default function DiscoverPage() {
  const [matches,       setMatches]       = useState<Match[]>([])
  const [skills,        setSkills]        = useState<Skill[]>([])
  const [selectedSkills,setSelectedSkills]= useState<string[]>([])
  const [searchQuery,   setSearchQuery]   = useState('')
  const [isLoading,     setIsLoading]     = useState(true)
  const [showFilters,   setShowFilters]   = useState(false)
  const [locationFilter,setLocationFilter]= useState('')

  useEffect(() => {
    Promise.all([getMatches(), getAllSkills()]).then(([m, s]) => {
      setMatches(m)
      setSkills(s)
      setIsLoading(false)
    })
  }, [])

  const toggleSkill = (name: string) =>
    setSelectedSkills(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name])

  const clearFilters = () => { setSelectedSkills([]); setSearchQuery(''); setLocationFilter('') }

  const filtered = matches.filter(m => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !m.profile.displayName.toLowerCase().includes(q) &&
        !(m.profile.location ?? '').toLowerCase().includes(q) &&
        !m.sharedTeach.some(s => s.toLowerCase().includes(q)) &&
        !m.sharedLearn.some(s => s.toLowerCase().includes(q))
      ) return false
    }
    if (selectedSkills.length > 0) {
      const has = m.sharedTeach.some(s => selectedSkills.includes(s)) ||
                  m.sharedLearn.some(s => selectedSkills.includes(s))
      if (!has) return false
    }
    if (locationFilter && !(m.profile.location ?? '').toLowerCase().includes(locationFilter.toLowerCase()))
      return false
    return true
  })

  return (
    <Layout>
      <div className="px-4 md:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Discover</h1>
              <p className="text-white/40 mt-2">Find people whose skills complement yours</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} iconLeft={<Filter size={15} />}>
                Filters
              </Button>
              <span className="text-sm text-white/30">{filtered.length} matches</span>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <Search size={15} className="text-white/30 shrink-0" />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill, or location…"
              className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl border overflow-hidden"
                style={{ background: '#151A24', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <label className="block text-xs text-white/40 mb-2">Filter by location</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border w-64"
                  style={{ background: '#0C1017', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <MapPin size={13} className="text-white/30" />
                  <input value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                    placeholder="e.g. Berlin"
                    className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skill filter chips */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">Filter by skill</span>
              {selectedSkills.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <X size={11} /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 14).map(s => (
                <SkillPill key={s.id} skill={s.name}
                  selected={selectedSkills.includes(s.name)}
                  onClick={() => toggleSkill(s.name)} size="sm" />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border p-5 animate-pulse"
                style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                    <div className="h-2 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/5 rounded" />
                  <div className="h-2 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-sm font-bold text-white">
                {filtered.length} potential swap{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((m, i) => <MatchCard key={m.id} match={m} delay={i * 0.05} />)}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(139,92,246,0.08)' }}>
              <Search size={28} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No matches found</h3>
            <p className="text-white/40 text-sm max-w-sm mb-5">
              Try adjusting your filters or add more skills in Settings.
            </p>
            <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
          </motion.div>
        )}

        {/* Stats */}
        {!isLoading && (
          <div className="mt-12 pt-8 border-t grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {[
              { value: matches.length > 0 ? `${Math.round(matches.reduce((a, m) => a + m.matchScore, 0) / matches.length)}%` : '—', label: 'Avg match score' },
              { value: matches.length, label: 'Total matches' },
              { value: skills.length,  label: 'Skills on platform' },
              { value: `${(matches.reduce((a, m) => a + m.profile.rating, 0) / Math.max(matches.length, 1)).toFixed(1)} ★`, label: 'Avg rating' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/30 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
