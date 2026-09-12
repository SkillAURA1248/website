import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SkillDNA, type SkillNode } from '../components/ui/SkillDNA'
import type { SkillLevel } from '../components/ui/SkillPill'
import { saveOnboardingProfile } from '../lib/onboardingService'
import { useAuth } from '../lib/auth'

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const POPULAR_SKILLS = [
  'Figma',
  'UI Design',
  'Photoshop',
  'HTML',
  'Photography',
  'Python',
  'Video Editing',
  'Marketing',
  'Excel',
  'Guitar',
]

const LEVELS: { value: SkillLevel; label: string; icon: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     icon: '🌱', desc: 'I know the basics' },
  { value: 'intermediate', label: 'Intermediate', icon: '⚡', desc: 'Comfortable & practising' },
  { value: 'advanced',     label: 'Advanced',     icon: '🔥', desc: 'Confident, can solve hard problems' },
  { value: 'expert',       label: 'Expert',       icon: '◆',  desc: 'Could teach it professionally' },
]

const TOTAL_STEPS = 3

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED ANIMATION VARIANTS
───────────────────────────────────────────────────────────────────────────── */
const pageVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48, scale: 0.98 }),
}

const pageTransition = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 34,
}

/* ─────────────────────────────────────────────────────────────────────────────
   ONBOARDING STATE TYPE
───────────────────────────────────────────────────────────────────────────── */
interface SkillLevelMap {
  [skill: string]: SkillLevel
}

interface OnboardingState {
  teachSkills: string[]
  learnSkills: string[]
  levels:      SkillLevelMap
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────────────────────────────────────── */
function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Track */}
      <div
        className="relative h-0.5 w-full rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Step ${step} of ${TOTAL_STEPS}`}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #8B5CF6, #A97EFF)',
            boxShadow:  '0 0 8px rgba(139,92,246,0.6)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n       = i + 1
          const done    = n < step
          const current = n === step

          return (
            <div key={n} className="flex items-center gap-1.5">
              <motion.div
                animate={current ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center justify-center rounded-full text-2xs font-bold"
                style={{
                  width:  18,
                  height: 18,
                  background: done
                    ? '#8B5CF6'
                    : current
                      ? 'rgba(139,92,246,0.20)'
                      : 'rgba(255,255,255,0.06)',
                  border: done
                    ? '1px solid #8B5CF6'
                    : current
                      ? '1px solid rgba(139,92,246,0.60)'
                      : '1px solid rgba(255,255,255,0.10)',
                  color: done ? '#fff' : current ? '#C9AAFF' : '#525C6A',
                  boxShadow: current ? '0 0 10px rgba(139,92,246,0.45)' : 'none',
                }}
              >
                {done ? <CheckMiniIcon /> : n}
              </motion.div>
              {n < TOTAL_STEPS && (
                <div
                  className="flex-1 h-px"
                  style={{
                    background: n < step
                      ? 'rgba(139,92,246,0.5)'
                      : 'rgba(255,255,255,0.07)',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKILL GRID TILE — shared by step 1 and step 2
───────────────────────────────────────────────────────────────────────────── */
function SkillTile({
  name,
  selected,
  onClick,
  disabled = false,
  warn     = false,
}: {
  name:     string
  selected: boolean
  onClick:  () => void
  disabled?: boolean
  warn?:    boolean
}) {
  return (
    <motion.button
      layout
      whileHover={disabled ? {} : { scale: 1.04, y: -2 }}
      whileTap={disabled   ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 440, damping: 28 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      className="relative flex items-center justify-between gap-2 px-4 py-3 rounded-xl
                 text-sm font-medium text-left transition-all duration-200 w-full"
      style={
        selected
          ? {
              background:  'rgba(139,92,246,0.16)',
              border:      '1px solid rgba(139,92,246,0.50)',
              color:       '#C9AAFF',
              boxShadow:   '0 0 18px rgba(139,92,246,0.22)',
            }
          : warn
            ? {
                background: 'rgba(251,191,36,0.06)',
                border:     '1px solid rgba(251,191,36,0.28)',
                color:      '#8892A0',
                cursor:     'default',
              }
            : {
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.08)',
                color:      '#8892A0',
              }
      }
    >
      <span>{name}</span>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(139,92,246,0.30)',
              border:     '1px solid rgba(139,92,246,0.60)',
            }}
            aria-hidden="true"
          >
            <CheckMiniIcon />
          </motion.span>
        )}
        {warn && !selected && (
          <motion.span
            key="warn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xs text-gold-400 shrink-0 font-semibold"
            style={{ color: '#FBBF24' }}
            aria-label="Already in Teach list"
          >
            ↑ teaching
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 1 — WHAT CAN YOU TEACH?
───────────────────────────────────────────────────────────────────────────── */
function Step1Teach({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (skill: string) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
          style={{
            background: 'linear-gradient(135deg, #F4F6FA 0%, #C9AAFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        >
          What Can You Teach?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-text-secondary max-w-md"
        >
          Start with something you could confidently help someone learn.
        </motion.p>
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5"
      >
        {POPULAR_SKILLS.map((skill, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.18 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <SkillTile
              name={skill}
              selected={selected.includes(skill)}
              onClick={() => onToggle(skill)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Selection count hint */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-2"
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border:     '1px solid rgba(139,92,246,0.30)',
                color:      '#C9AAFF',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-glow-pulse"
                aria-hidden="true"
              />
              {selected.length} skill{selected.length > 1 ? 's' : ''} selected
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 2 — WHAT DO YOU WANT TO LEARN?
───────────────────────────────────────────────────────────────────────────── */
function Step2Learn({
  selected,
  teachSkills,
  onToggle,
}: {
  selected:    string[]
  teachSkills: string[]
  onToggle:    (skill: string) => void
}) {
  const conflicts = selected.filter(s => teachSkills.includes(s))
  const showConflict = conflicts.length > 0

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
          style={{
            background: 'linear-gradient(135deg, #F4F6FA 0%, #FCD34D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        >
          What Do You Want to Learn?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-text-secondary max-w-md"
        >
          Choose the skills you'd love to exchange for.
        </motion.p>
      </div>

      {/* Conflict warning */}
      <AnimatePresence>
        {showConflict && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3.5"
              style={{
                background:  'rgba(251,191,36,0.08)',
                border:      '1px solid rgba(251,191,36,0.25)',
                borderLeft:  '3px solid #FBBF24',
              }}
              role="alert"
            >
              <span className="text-base shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-gold-300" style={{ color: '#FCD34D' }}>
                  {conflicts.join(', ')} {conflicts.length === 1 ? 'is' : 'are'} already in your teach list.
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  You can still select it — swaps work both ways. But it might confuse your match.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5"
      >
        {POPULAR_SKILLS.map((skill, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.18 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <SkillTile
              name={skill}
              selected={selected.includes(skill)}
              warn={teachSkills.includes(skill) && !selected.includes(skill)}
              onClick={() => onToggle(skill)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Selection count hint */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(251,191,36,0.10)',
                border:     '1px solid rgba(251,191,36,0.28)',
                color:      '#FCD34D',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-glow-pulse"
                style={{ background: '#FBBF24' }}
                aria-hidden="true"
              />
              {selected.length} skill{selected.length > 1 ? 's' : ''} selected
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEVEL SELECTOR — horizontal pill row for a single skill
───────────────────────────────────────────────────────────────────────────── */
function LevelSelector({
  skill,
  current,
  onChange,
}: {
  skill:    string
  current:  SkillLevel
  onChange: (level: SkillLevel) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background:  'linear-gradient(135deg, #11151D 0%, #0D1118 100%)',
        border:      '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Skill name row */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-sm font-bold text-text-primary">{skill}</span>
        {/* Current level badge */}
        {(() => {
          const meta = LEVELS.find(l => l.value === current)!
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border:     '1px solid rgba(139,92,246,0.28)',
                color:      '#C9AAFF',
              }}
            >
              <span aria-hidden="true">{meta.icon}</span>
              {meta.label}
            </span>
          )
        })()}
      </div>

      {/* Level buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
        {LEVELS.map((lvl, i) => {
          const isActive = current === lvl.value
          const isLast   = i === LEVELS.length - 1
          const isFirst  = i === 0

          return (
            <motion.button
              key={lvl.value}
              whileHover={{ background: isActive ? undefined : 'rgba(255,255,255,0.04)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(lvl.value)}
              aria-pressed={isActive}
              className="flex flex-col items-center gap-1 px-3 py-4 transition-all duration-200
                         relative focus:outline-none"
              style={
                isActive
                  ? {
                      background: 'rgba(139,92,246,0.14)',
                      borderRight: !isLast ? '1px solid rgba(139,92,246,0.15)' : 'none',
                    }
                  : {
                      borderRight: !isLast ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }
              }
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId={`level-bar-${skill}`}
                  className="absolute top-0 inset-x-0 h-0.5 rounded-b"
                  style={{ background: 'linear-gradient(90deg, #8B5CF6, #A97EFF)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              <span className="text-xl leading-none" aria-hidden="true">{lvl.icon}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: isActive ? '#C9AAFF' : '#525C6A' }}
              >
                {lvl.label}
              </span>
              <span
                className="text-2xs text-center leading-tight hidden sm:block"
                style={{ color: isActive ? 'rgba(169,126,255,0.70)' : '#353D47' }}
              >
                {lvl.desc}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 3 — HOW GOOD ARE YOU?
───────────────────────────────────────────────────────────────────────────── */
function Step3Levels({
  teachSkills,
  levels,
  onLevelChange,
}: {
  teachSkills:   string[]
  levels:        SkillLevelMap
  onLevelChange: (skill: string, level: SkillLevel) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
          style={{
            background: 'linear-gradient(135deg, #F4F6FA 0%, #A97EFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        >
          How Good Are You?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-text-secondary max-w-md"
        >
          Set a level for each skill you're teaching. Be honest — it helps us find better matches.
        </motion.p>
      </div>

      {/* Level selectors — one per teach skill */}
      <div className="flex flex-col gap-4">
        {teachSkills.map((skill, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <LevelSelector
              skill={skill}
              current={levels[skill] ?? 'intermediate'}
              onChange={level => onLevelChange(skill, level)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FINAL SCREEN — SKILL DNA REVEAL
───────────────────────────────────────────────────────────────────────────── */
function FinalScreen({
  teachSkills,
  learnSkills,
  levels,
  saving,
  onEnter,
}: {
  teachSkills: string[]
  learnSkills: string[]
  levels:      SkillLevelMap
  saving:      boolean
  onEnter:     () => void
}) {
  /* Build SkillDNA nodes from onboarding data */
  const dnaNodes: SkillNode[] = [
    ...teachSkills.map((skill, i) => ({
      id:    `teach-${skill}`,
      label: skill,
      kind:  'teach' as const,
      level: (levels[skill] ?? 'intermediate') as SkillNode['level'],
      angle: (i * (180 / Math.max(teachSkills.length, 1))) - 90,  // left hemisphere
      dist:  0.76,
    })),
    ...learnSkills.map((skill, i) => ({
      id:    `learn-${skill}`,
      label: skill,
      kind:  'learn' as const,
      level: 'beginner' as const,
      angle: (i * (180 / Math.max(learnSkills.length, 1))) + 90,  // right hemisphere
      dist:  0.76,
    })),
  ]

  return (
    <div className="flex flex-col items-center gap-10 py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center flex flex-col gap-3"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mx-auto"
          style={{
            background: 'rgba(139,92,246,0.14)',
            border:     '1px solid rgba(139,92,246,0.32)',
            color:      '#C9AAFF',
          }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
            aria-hidden="true"
          />
          Your profile is ready
        </span>

        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
          style={{
            background: 'linear-gradient(135deg, #F4F6FA 0%, #C9AAFF 50%, #FBBF24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        >
          Your Skill DNA
        </h1>

        <p className="text-base text-text-secondary max-w-sm mx-auto">
          Your Skill DNA is ready.
        </p>
      </motion.div>

      {/* DNA Network */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex justify-center"
      >
        {/* Ambient glow behind the network */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 70%)',
            filter:     'blur(24px)',
          }}
        />
        <div
          className="rounded-3xl relative"
          style={{
            background: 'rgba(12,16,23,0.80)',
            border:     '1px solid rgba(255,255,255,0.07)',
            boxShadow:  '0 0 60px rgba(139,92,246,0.15)',
            padding:    '2rem',
          }}
        >
          <SkillDNA
            nodes={dnaNodes}
            size={320}
            animated
            centerLabel="YOU"
          />
        </div>
      </motion.div>

      {/* Teach / Learn summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-4 w-full max-w-md"
      >
        {/* Teaching */}
        <div
          className="rounded-xl px-4 py-4 flex flex-col gap-3"
          style={{
            background: 'rgba(139,92,246,0.07)',
            border:     '1px solid rgba(139,92,246,0.18)',
          }}
        >
          <p className="text-2xs font-bold uppercase tracking-widest text-text-muted">You Teach</p>
          <div className="flex flex-wrap gap-1.5">
            {teachSkills.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  background: 'rgba(139,92,246,0.14)',
                  border:     '1px solid rgba(139,92,246,0.28)',
                  color:      '#C9AAFF',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Learning */}
        <div
          className="rounded-xl px-4 py-4 flex flex-col gap-3"
          style={{
            background: 'rgba(251,191,36,0.06)',
            border:     '1px solid rgba(251,191,36,0.16)',
          }}
        >
          <p className="text-2xs font-bold uppercase tracking-widest text-text-muted">You Learn</p>
          <div className="flex flex-wrap gap-1.5">
            {learnSkills.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  background: 'rgba(251,191,36,0.10)',
                  border:     '1px solid rgba(251,191,36,0.22)',
                  color:      '#FCD34D',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(251,191,36,0.50)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={onEnter}
          disabled={saving}
          className="h-14 px-10 rounded-2xl text-base font-bold text-[#07090D]
                     flex items-center gap-3 transition-all duration-200
                     disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
            boxShadow:  '0 0 24px rgba(251,191,36,0.30)',
          }}
          aria-busy={saving}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-[#07090D]/30 border-t-[#07090D] animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              Enter SkillSwap
              <ArrowRightIcon />
            </>
          )}
        </motion.button>
        <p className="text-xs text-text-muted">You can always update your skills later</p>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ONBOARDING PAGE — top-level orchestrator
───────────────────────────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { reload } = useAuth()

  /* ── Wizard state ───────────────────────────────────────────────────── */
  const [step, setStep]       = useState(1)             // 1 | 2 | 3 | 4(done)
  const [direction, setDir]   = useState(1)             // +1 forward / -1 back
  const [saving, setSaving]   = useState(false)
  const [state, setState]     = useState<OnboardingState>({
    teachSkills: [],
    learnSkills: [],
    levels:      {},
  })

  /* ── Helpers ────────────────────────────────────────────────────────── */
  const advance = (toStep: number) => {
    setDir(toStep > step ? 1 : -1)
    setStep(toStep)
  }

  const toggleTeach = useCallback((skill: string) => {
    setState(prev => {
      const next = prev.teachSkills.includes(skill)
        ? prev.teachSkills.filter(s => s !== skill)
        : [...prev.teachSkills, skill]
      // auto-set level to intermediate if not yet set
      const levels = { ...prev.levels }
      if (!levels[skill]) levels[skill] = 'intermediate'
      return { ...prev, teachSkills: next, levels }
    })
  }, [])

  const toggleLearn = useCallback((skill: string) => {
    setState(prev => ({
      ...prev,
      learnSkills: prev.learnSkills.includes(skill)
        ? prev.learnSkills.filter(s => s !== skill)
        : [...prev.learnSkills, skill],
    }))
  }, [])

  const setLevel = useCallback((skill: string, level: SkillLevel) => {
    setState(prev => ({ ...prev, levels: { ...prev.levels, [skill]: level } }))
  }, [])

  /* ── Final submit ───────────────────────────────────────────────────── */
  const handleEnter = async () => {
    setSaving(true)
    try {
      await saveOnboardingProfile({
        teachSkills: state.teachSkills.map(name => ({
          name,
          level: state.levels[name] ?? 'intermediate',
        })),
        learnSkills: state.learnSkills,
      })
      // Sync AuthContext with the freshly saved profile before navigating
      await reload()
    } catch {
      // ignore save errors — local storage might be unavailable
    }
    setSaving(false)
    navigate('/discover')
  }

  /* ── Step-level CTA logic ───────────────────────────────────────────── */
  const canContinueStep1 = state.teachSkills.length > 0
  const canContinueStep2 = state.learnSkills.length > 0

  /* ─────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#07090D' }}
    >
      {/* Fixed atmospheric glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(139,92,246,0.16) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 15% 80%, rgba(139,92,246,0.07) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5" aria-label="SkillSwap home">
          <LogoMark />
          <span className="text-sm font-bold tracking-tight text-text-primary">
            Skill<span className="text-purple-400">Swap</span>
          </span>
        </a>

        {/* Step counter */}
        {step <= TOTAL_STEPS && (
          <span className="text-xs font-semibold text-text-muted tabular-nums">
            Step{' '}
            <span className="text-text-secondary">{String(step).padStart(2, '0')}</span>
            {' / '}
            {String(TOTAL_STEPS).padStart(2, '0')}
          </span>
        )}
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 pb-16">
        <div className="w-full max-w-3xl flex flex-col gap-8">

          {/* Progress bar — only for steps 1-3 */}
          {step <= TOTAL_STEPS && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProgressBar step={step} />
            </motion.div>
          )}

          {/* ── Step content with slide transitions ─────────────────────── */}
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
                <Step1Teach selected={state.teachSkills} onToggle={toggleTeach} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
                <Step2Learn
                  selected={state.learnSkills}
                  teachSkills={state.teachSkills}
                  onToggle={toggleLearn}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
                <Step3Levels
                  teachSkills={state.teachSkills}
                  levels={state.levels}
                  onLevelChange={setLevel}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
                <FinalScreen
                  teachSkills={state.teachSkills}
                  learnSkills={state.learnSkills}
                  levels={state.levels}
                  saving={saving}
                  onEnter={handleEnter}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation buttons (steps 1–3 only) ─────────────────────── */}
          {step <= TOTAL_STEPS && (
            <motion.div
              key={`nav-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="flex items-center justify-between gap-4 pt-2"
            >
              {/* Back */}
              <button
                onClick={() => advance(step - 1)}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                           text-text-secondary hover:text-text-primary
                           hover:bg-white/[0.04] transition-all duration-150
                           disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronLeftIcon />
                Back
              </button>

              {/* Continue / Finish */}
              <motion.button
                whileHover={
                  (step === 1 ? canContinueStep1 : step === 2 ? canContinueStep2 : true)
                    ? { scale: 1.03, boxShadow: '0 0 32px rgba(251,191,36,0.42)' }
                    : {}
                }
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                onClick={() => {
                  if (step === TOTAL_STEPS) {
                    handleEnter()
                  } else {
                    advance(step + 1)
                  }
                }}
                disabled={
                  (step === 1 && !canContinueStep1) ||
                  (step === 2 && !canContinueStep2) ||
                  saving
                }
                className="flex items-center gap-2 h-11 px-7 rounded-xl text-sm font-bold
                           transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  color:      '#07090D',
                  boxShadow:  '0 0 18px rgba(251,191,36,0.26)',
                }}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#07090D]/30 border-t-[#07090D] animate-spin" />
                    Saving…
                  </>
                ) : step === TOTAL_STEPS ? (
                  <>Enter SkillSwap <ArrowRightIcon /></>
                ) : (
                  <>Continue <ArrowRightIcon /></>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOCAL ICON PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */
function CheckMiniIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoMark() {
  return <img src="/logo.jpeg" alt="SkillSwap" className="w-6 h-6 rounded-md object-contain" aria-hidden="true" />
}
