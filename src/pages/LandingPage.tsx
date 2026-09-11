import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { LandingNav } from '../components/ui/LandingNav'
import { SkillPill } from '../components/ui/SkillPill'
import { SkillDNA } from '../components/ui/SkillDNA'

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as number[] },
})

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

/* ─────────────────────────────────────────────────────────────────────────────
   BACKGROUND — atmospheric blobs rendered behind each section that needs glow
───────────────────────────────────────────────────────────────────────────── */
function PurpleBlob({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
      style={{
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
        filter: 'blur(48px)',
      }}
    />
  )
}

function GoldBlob({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
      style={{
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.12) 0%, transparent 70%)',
        filter: 'blur(56px)',
      }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION WRAPPER — reveals on scroll
───────────────────────────────────────────────────────────────────────────── */
function RevealSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const { ref, inView } = useReveal()
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   HERO BACKGROUND — decorative SVG grid + flowing curves
───────────────────────────────────────────────────────────────────────────── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large central purple bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.20) 0%, transparent 70%)',
        }}
      />
      {/* Bottom-left warm leak */}
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[300px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(139,92,246,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Bottom-right gold accent */}
      <div
        className="absolute bottom-0 right-0 w-[350px] h-[250px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 100% 100%, rgba(251,191,36,0.07) 0%, transparent 70%)',
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 40%, rgba(0,0,0,0.7) 0%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 40%, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }}
      />
      {/* Curved decorative lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M -100 500 Q 360 200 720 450 Q 1080 700 1540 350"
          stroke="#8B5CF6"
          strokeWidth="1"
          strokeDasharray="8 6"
        />
        <path
          d="M -100 350 Q 400 600 800 300 Q 1100 50 1540 500"
          stroke="#8B5CF6"
          strokeWidth="0.8"
          strokeDasharray="5 8"
        />
        <path
          d="M 200 900 Q 600 550 900 700 Q 1200 850 1440 600"
          stroke="#FBBF24"
          strokeWidth="0.6"
          strokeDasharray="4 10"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEACH / LEARN INTERACTIVE PANEL
───────────────────────────────────────────────────────────────────────────── */
const TEACH_SKILLS = [
  { name: 'Figma',      level: 'expert'       as const },
  { name: 'UI Design',  level: 'advanced'     as const },
  { name: 'HTML',       level: 'intermediate' as const },
  { name: 'Branding',   level: 'intermediate' as const },
]

const LEARN_SKILLS = [
  { name: 'Photography',   level: 'beginner' as const },
  { name: 'Motion Design', level: 'beginner' as const },
  { name: 'Video Editing', level: 'beginner' as const },
]

function TeachLearnPanel({ onFindSwap }: { onFindSwap: () => void }) {
  const [selectedTeach, setSelectedTeach] = useState<Set<string>>(new Set(['Figma']))
  const [selectedLearn, setSelectedLearn] = useState<Set<string>>(new Set(['Photography']))

  const toggleTeach = (name: string) =>
    setSelectedTeach(prev => {
      const n = new Set(prev)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })

  const toggleLearn = (name: string) =>
    setSelectedLearn(prev => {
      const n = new Set(prev)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })

  const hasSelection = selectedTeach.size > 0 && selectedLearn.size > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden"
      style={{
        background: '#0C1017',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 0 60px rgba(139,92,246,0.12), 0 32px 80px rgba(0,0,0,0.5)',
      }}
    >
      {/* Inner top glow */}
      <div
        className="absolute top-0 inset-x-0 h-24 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0">

        {/* ── LEFT: I CAN TEACH ───────────────────────────────────── */}
        <div className="p-6 md:p-8">
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
            I Can Teach
          </p>
          <div className="flex flex-wrap gap-2.5">
            {TEACH_SKILLS.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.65 + i * 0.07 }}
              >
                <SkillPill
                  skill={s.name}
                  level={s.level}
                  selected={selectedTeach.has(s.name)}
                  onClick={() => toggleTeach(s.name)}
                  size="md"
                />
              </motion.div>
            ))}
          </div>
          {selectedTeach.size > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-text-muted"
            >
              {selectedTeach.size} skill{selectedTeach.size > 1 ? 's' : ''} selected
            </motion.p>
          )}
        </div>

        {/* ── CENTER DIVIDER ──────────────────────────────────────── */}
        <div
          className="flex md:flex-col items-center justify-center px-4 md:px-0 py-2 md:py-8 gap-3"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Animated exchange icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.30)',
              boxShadow: '0 0 18px rgba(139,92,246,0.20)',
            }}
            aria-hidden="true"
          >
            <SwapIcon />
          </motion.div>
          {/* Animated connecting line */}
          <div className="hidden md:block w-px flex-1" style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(251,191,36,0.3))' }} aria-hidden="true" />
          <div className="md:hidden h-px w-8" style={{ background: 'linear-gradient(to right, rgba(139,92,246,0.4), rgba(251,191,36,0.3))' }} aria-hidden="true" />
        </div>

        {/* ── RIGHT: I WANT TO LEARN ──────────────────────────────── */}
        <div className="p-6 md:p-8">
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
            I Want to Learn
          </p>
          <div className="flex flex-wrap gap-2.5">
            {LEARN_SKILLS.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.65 + i * 0.07 }}
              >
                <SkillPill
                  skill={s.name}
                  level={s.level}
                  selected={selectedLearn.has(s.name)}
                  onClick={() => toggleLearn(s.name)}
                  size="md"
                />
              </motion.div>
            ))}
          </div>
          {selectedLearn.size > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-text-muted"
            >
              {selectedLearn.size} skill{selectedLearn.size > 1 ? 's' : ''} selected
            </motion.p>
          )}
        </div>
      </div>

      {/* ── CTA row ─────────────────────────────────────────────────── */}
      <div
        className="relative z-10 px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs text-text-muted text-center sm:text-left">
          {hasSelection
            ? `Matching ${selectedTeach.size + selectedLearn.size} skills — let's find your swap`
            : 'Select skills on both sides to find your match'}
        </p>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(251,191,36,0.45)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={onFindSwap}
          className="shrink-0 h-11 px-7 rounded-xl text-sm font-bold text-[#07090D]
                     transition-all duration-200 flex items-center gap-2"
          style={{
            background: hasSelection
              ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)'
              : 'rgba(251,191,36,0.35)',
            color: hasSelection ? '#07090D' : 'rgba(251,191,36,0.6)',
            boxShadow: hasSelection ? '0 0 20px rgba(251,191,36,0.30)' : 'none',
          }}
        >
          Find My Perfect Swap
          <span aria-hidden="true">→</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Share What You Know',
    desc: 'Add the skills you\'re confident teaching. One skill or ten — every bit of knowledge has value.',
    icon: <ShareIcon />,
  },
  {
    num: '02',
    title: 'Choose What You Want',
    desc: 'Tell us what you\'d love to learn. Be as specific or exploratory as you like.',
    icon: <TargetIcon />,
  },
  {
    num: '03',
    title: 'Find Your Perfect Swap',
    desc: 'We connect complementary skills. You teach them Figma, they teach you Photography.',
    icon: <ConnectIcon />,
  },
]

function HowItWorks() {
  const { ref, inView } = useReveal()

  return (
    <RevealSection id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      <PurpleBlob className="top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]" />

      <div className="ss-container px-4 md:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
            The Process
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #F4F6FA 0%, #C9AAFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col gap-5 p-7 rounded-2xl group"
              style={{
                background: 'linear-gradient(135deg, #11151D 0%, #0C1017 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Step number */}
              <span
                className="text-5xl font-extrabold leading-none select-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.08) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                aria-hidden="true"
              >
                {step.num}
              </span>

              {/* Icon badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-400"
                style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.20)' }}
              >
                {step.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold text-text-primary">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>

              {/* Connector arrow — only between cards on desktop */}
              {i < 2 && (
                <div
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10
                             w-8 h-8 items-center justify-center rounded-full"
                  style={{ background: '#07090D', border: '1px solid rgba(255,255,255,0.08)' }}
                  aria-hidden="true"
                >
                  <ChevronRightIcon />
                </div>
              )}

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(139,92,246,0.25)' }}
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FEATURED MATCHES
───────────────────────────────────────────────────────────────────────────── */
const FEATURED_MATCHES = [
  {
    name: 'Ananya Krishnan',
    initials: 'AK',
    desc: 'Visual storyteller based in Bangalore',
    teaches: ['Photography', 'Lightroom'],
    wants: ['Figma', 'UI Design'],
    match: 94,
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    status: 'Online now',
    statusColor: '#22C55E',
  },
  {
    name: 'Luca Moretti',
    initials: 'LM',
    desc: 'Frontend engineer & design systems nerd',
    teaches: ['React', 'TypeScript'],
    wants: ['Motion Design', 'Branding'],
    match: 87,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    status: 'Available',
    statusColor: '#34D399',
  },
  {
    name: 'Priya Nair',
    initials: 'PN',
    desc: 'Illustrator & creative director, Mumbai',
    teaches: ['Illustration', 'Procreate'],
    wants: ['HTML', 'CSS', 'Figma'],
    match: 81,
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    status: 'Active today',
    statusColor: '#FBBF24',
  },
]

function FeaturedMatches({ onViewSwap }: { onViewSwap: () => void }) {
  const { ref, inView } = useReveal()

  return (
    <RevealSection
      id="featured-matches"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <GoldBlob className="bottom-0 right-0 w-[500px] h-[400px] translate-x-1/4 translate-y-1/4" />
      <PurpleBlob className="top-0 left-0 w-[400px] h-[300px] -translate-x-1/4 -translate-y-1/4" />

      <div className="ss-container px-4 md:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
            Real Connections
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Your Next Swap Could{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #C9AAFF 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Look Like This
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED_MATCHES.map((person, i) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 24 } }}
              className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(160deg, #13181F 0%, #0D1118 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
              onClick={onViewSwap}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onViewSwap()}
              aria-label={`View swap with ${person.name}`}
            >
              {/* Match % badge — top right */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.35)',
                    color: '#C9AAFF',
                    boxShadow: '0 0 12px rgba(139,92,246,0.20)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#8B5CF6' }}
                    aria-hidden="true"
                  />
                  {person.match}% Match
                </span>
              </div>

              {/* Card body */}
              <div className="p-6 flex flex-col gap-5 flex-1">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 pr-20">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{
                      background: person.gradient,
                      boxShadow: '0 0 0 2px rgba(255,255,255,0.07)',
                    }}
                    aria-hidden="true"
                  >
                    {person.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary leading-tight">{person.name}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{person.desc}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: person.statusColor, boxShadow: `0 0 5px ${person.statusColor}88` }}
                        aria-hidden="true"
                      />
                      <span className="text-2xs text-text-muted">{person.status}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                {/* Teaches */}
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">Teaches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {person.teaches.map(skill => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: 'rgba(139,92,246,0.10)',
                          border: '1px solid rgba(139,92,246,0.22)',
                          color: '#C9AAFF',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Wants */}
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">Wants to Learn</p>
                  <div className="flex flex-wrap gap-1.5">
                    {person.wants.map(skill => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: 'rgba(251,191,36,0.08)',
                          border: '1px solid rgba(251,191,36,0.20)',
                          color: '#FCD34D',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card footer CTA */}
              <div
                className="px-6 py-4 flex items-center justify-end"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300
                                 flex items-center gap-1.5 transition-colors duration-150">
                  View Swap
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    →
                  </motion.span>
                </span>
              </div>

              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(139,92,246,0.30)' }}
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKILL DNA PREVIEW
───────────────────────────────────────────────────────────────────────────── */
function SkillDNAPreview({ onExplore }: { onExplore: () => void }) {
  const { ref, inView } = useReveal()

  return (
    <RevealSection
      id="skill-dna-preview"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Full-width ambient glow centred on the network */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(139,92,246,0.10) 0%, transparent 65%)',
        }}
      />

      <div className="ss-container px-4 md:px-6 lg:px-8 relative z-10">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — network visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div
              className="rounded-3xl p-6 sm:p-10 relative"
              style={{
                background: '#0C1017',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 0 80px rgba(139,92,246,0.14)',
              }}
            >
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)',
                }}
              />
              <SkillDNA size={340} animated />
            </div>
          </motion.div>

          {/* Right — copy */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-7"
          >
            <div className="flex flex-col gap-4">
              <p className="text-2xs font-bold uppercase tracking-[0.18em] text-text-muted">
                Signature Feature
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
                Your Skills Have{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #C9AAFF 0%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  A Pattern.
                </span>
              </h2>
              <p className="text-base text-text-secondary leading-relaxed max-w-md">
                Skill DNA turns everything you know and everything you want to learn into a living map.
                It finds the connections you didn't know you had — and the people who complete them.
              </p>
            </div>

            {/* Feature list */}
            <ul className="flex flex-col gap-3">
              {[
                'Interactive network of teaching & learning nodes',
                'Glowing connections show complementary pairings',
                'Grows with every skill you add',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#8B5CF6', boxShadow: '0 0 6px rgba(139,92,246,0.7)' }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.03, x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={onExplore}
              className="self-start flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold
                         transition-all duration-200"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.35)',
                color: '#C9AAFF',
                boxShadow: '0 0 20px rgba(139,92,246,0.15)',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.background = 'rgba(139,92,246,0.22)'
                t.style.boxShadow  = '0 0 28px rgba(139,92,246,0.30)'
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.background = 'rgba(139,92,246,0.15)'
                t.style.boxShadow  = '0 0 20px rgba(139,92,246,0.15)'
              }}
            >
              Explore Skill DNA
              <span aria-hidden="true">→</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </RevealSection>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────────────────────────────────────────── */
function FinalCTA({ onCTA }: { onCTA: () => void }) {
  const { ref, inView } = useReveal()

  return (
    <RevealSection className="relative py-24 md:py-36 overflow-hidden">
      {/* Large centred bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(139,92,246,0.16) 0%, transparent 65%)',
        }}
      />
      {/* Decorative ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          border: '1px solid rgba(139,92,246,0.10)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          border: '1px solid rgba(139,92,246,0.08)',
        }}
      />

      <div ref={ref} className="ss-container px-4 md:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-col gap-3">
            <p className="text-2xs font-bold uppercase tracking-[0.18em] text-text-muted">
              Ready?
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
              <span className="text-text-primary">Your Next Skill</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 80%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Is One Swap Away.
              </span>
            </h2>
          </div>

          <p className="text-base text-text-secondary max-w-sm">
            Don't pay for another course. Find someone who already knows it — and teach them something back.
          </p>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(251,191,36,0.55)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            onClick={onCTA}
            className="h-14 px-10 rounded-2xl text-base font-bold text-[#07090D]
                       flex items-center gap-3 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow: '0 0 28px rgba(251,191,36,0.35)',
            }}
          >
            Find My Perfect Swap
            <span className="text-lg" aria-hidden="true">→</span>
          </motion.button>

          <p className="text-xs text-text-muted">
            Free to join · No subscriptions · Just knowledge
          </p>
        </motion.div>
      </div>
    </RevealSection>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────────────────── */
const FOOTER_LINKS = [
  { label: 'Discover',  to: '/discover'  },
  { label: 'Skill DNA', to: '/skill-dna' },
  { label: 'About',     to: '/about'     },
  { label: 'Privacy',   to: '/privacy'   },
]

function Footer() {
  return (
    <footer
      className="relative py-12"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="ss-container px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <LogoMarkSmall />
              <span className="text-sm font-bold text-text-primary">
                Skill<span className="text-purple-400">Swap</span>
              </span>
            </div>
            <p className="text-xs text-text-muted italic">"Knowledge is better when shared."</p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            {FOOTER_LINKS.map(({ label, to }) => (
              <a
                key={to}
                href={to}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} SkillSwap
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   LANDING PAGE — composed
───────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-base">
      <LandingNav />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center
                   pt-14 pb-16 px-4 md:px-6 lg:px-8 overflow-hidden"
        aria-label="Hero"
      >
        <HeroBackground />

        <div className="relative z-10 w-full flex flex-col items-center gap-10 max-w-5xl mx-auto">

          {/* Eyebrow tag */}
          <motion.div {...fadeUp(0.1)}>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.28)',
                color: '#C9AAFF',
              }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-purple-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                aria-hidden="true"
              />
              Now in Beta — Join the community
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div {...fadeUp(0.2)} className="text-center">
            <h1
              className="text-[clamp(3rem,10vw,7rem)] font-extrabold leading-none tracking-tight"
              style={{
                background: 'linear-gradient(160deg, #F4F6FA 0%, #F4F6FA 40%, rgba(244,246,250,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Don't Buy a Skill.
            </h1>
            <h1
              className="text-[clamp(3rem,10vw,7rem)] font-extrabold leading-none tracking-tight mt-1"
              style={{
                background: 'linear-gradient(135deg, #C9AAFF 0%, #8B5CF6 50%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Swap One.
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            {...fadeUp(0.32)}
            className="text-lg md:text-xl text-text-secondary text-center max-w-lg leading-relaxed"
          >
            Turn what you know into what you want to learn.
          </motion.p>

          {/* Teach / Learn panel */}
          <div className="w-full">
            <TeachLearnPanel onFindSwap={() => navigate('/discover')} />
          </div>

          {/* Scroll hint */}
          <motion.div
            {...fadeUp(0.8)}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="flex flex-col items-center gap-2"
            aria-hidden="true"
          >
            <span className="text-2xs text-text-muted tracking-widest uppercase">Scroll</span>
            <ChevronDownIcon />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── FEATURED MATCHES ────────────────────────────────────────────── */}
      <FeaturedMatches onViewSwap={() => navigate('/discover')} />

      {/* ── SKILL DNA PREVIEW ───────────────────────────────────────────── */}
      <SkillDNAPreview onExplore={() => navigate('/skill-dna')} />

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <FinalCTA onCTA={() => navigate('/discover')} />

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOCAL ICON PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */
function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 6h9M9 3l3 3-3 3M15 12H6M9 15l-3-3 3-3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4"  cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 7l4-2M6 9l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  )
}
function ConnectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8h3M8 8l2.5-2.5M8 8l2.5 2.5"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function LogoMarkSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8"  cy="10" r="3.5" fill="#8B5CF6" fillOpacity="0.9" />
      <circle cx="16" cy="10" r="3.5" fill="#FBBF24" fillOpacity="0.9" />
      <path d="M11 10 L13 10" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
      <circle cx="12" cy="16" r="2" fill="#ffffff" fillOpacity="0.25" />
    </svg>
  )
}
