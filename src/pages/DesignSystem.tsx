import { useState } from 'react'
import { motion } from 'framer-motion'

import { Navigation } from '../components/ui/Navigation'
import { Button, CTAButton, IconButton } from '../components/ui/Button'
import { Card, MatchCard, StatCard } from '../components/ui/Card'
import { SkillPill, SkillTagGroup, LevelBadge } from '../components/ui/SkillPill'
import { StatusBadge, StatusRow, CountBadge } from '../components/ui/StatusBadge'
import { Input, Textarea, Select, SearchInput } from '../components/ui/FormInput'
import { LockedFeature, InlineLocked } from '../components/ui/LockedFeature'
import { SkillDNA } from '../components/ui/SkillDNA'
import { PerfectSwap } from '../components/ui/PerfectSwap'
import { Heading, Text, Highlight, SectionHeader, Code, Kbd, Callout } from '../components/ui/Typography'

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function Section({
  id,
  label,
  title,
  children,
}: {
  id:       string
  label:    string
  title:    string
  children: React.ReactNode
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="ss-section"
    >
      <SectionHeader label={label} title={title} className="mb-8" />
      {children}
    </motion.section>
  )
}

/* ─── Token swatch ───────────────────────────────────────────────────────── */
function ColorSwatch({
  color,
  label,
  hex,
}: {
  color: string
  label: string
  hex:   string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="w-full h-14 rounded-xl border"
        style={{ background: color, borderColor: 'rgba(255,255,255,0.08)' }}
      />
      <div>
        <p className="text-xs font-semibold text-text-primary">{label}</p>
        <p className="text-2xs text-text-muted font-mono">{hex}</p>
      </div>
    </div>
  )
}

/* ─── Divider ────────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div
      className="my-2 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
      aria-hidden="true"
    />
  )
}

/* ─── Main showcase ──────────────────────────────────────────────────────── */
export default function DesignSystem() {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(['Figma']))
  const [inputVal, setInputVal]             = useState('')
  const [activeNav, setActiveNav]           = useState('#discover')

  const toggleSkill = (name: string) =>
    setSelectedSkills(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const demoSkills = [
    { name: 'Figma',       level: 'expert'       as const },
    { name: 'UI Design',   level: 'advanced'     as const },
    { name: 'Photography', level: 'intermediate' as const },
    { name: 'HTML / CSS',  level: 'beginner'     as const },
    { name: 'React',       level: 'intermediate' as const },
  ]

  const selectableSkills = demoSkills.map(s => ({
    ...s,
    selected: selectedSkills.has(s.name),
  }))

  return (
    <div className="min-h-screen">
      <Navigation activeLink={activeNav} onLinkClick={setActiveNav} />

      <main className="ss-page ss-container">

        {/* ════════════════════════════════════════════════════════════
            HERO HEADER
        ════════════════════════════════════════════════════════════ */}
        <div className="pt-16 pb-12 text-center relative">
          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border:     '1px solid rgba(139,92,246,0.28)',
                color:      '#C9AAFF',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-glow-pulse" aria-hidden="true" />
              Design System · v1.0
            </span>

            <Heading level="display" gradient className="mb-5">
              SkillSwap
              <br />
              Design Language
            </Heading>

            <Text variant="lead" className="max-w-lg mx-auto mb-8">
              A premium dark-mode visual system for the{' '}
              <Highlight color="purple">SkillSwap</Highlight> platform —
              every token, component, and pattern in one place.
            </Text>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <CTAButton>Find My Swap</CTAButton>
              <Button variant="secondary">View Source</Button>
            </div>
          </motion.div>
        </div>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            01 · COLOR SYSTEM
        ════════════════════════════════════════════════════════════ */}
        <Section id="colors" label="01 · Foundations" title="Color System">
          <div className="space-y-8">

            {/* Background ramp */}
            <div>
              <Text variant="label" className="mb-3 block">Backgrounds</Text>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ColorSwatch color="#07090D" label="Base"           hex="#07090D" />
                <ColorSwatch color="#0C1017" label="Secondary"      hex="#0C1017" />
                <ColorSwatch color="#11151D" label="Card"           hex="#11151D" />
                <ColorSwatch color="#151A24" label="Card Elevated"  hex="#151A24" />
              </div>
            </div>

            {/* Accents */}
            <div>
              <Text variant="label" className="mb-3 block">Accent — Purple</Text>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  ['#C9AAFF','200'],['#A97EFF','300'],['#8B5CF6','400 ★'],
                  ['#7C3AED','500'],['#6D28D9','600'],['#5B21B6','700'],
                ].map(([hex, lbl]) => (
                  <ColorSwatch key={hex} color={hex} label={`Purple ${lbl}`} hex={hex} />
                ))}
              </div>
            </div>

            <div>
              <Text variant="label" className="mb-3 block">Accent — Gold / CTA</Text>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[
                  ['#FCD34D','200'],['#FBBF24','400 ★'],['#F59E0B','500'],
                  ['#D97706','600'],['#B45309','700'],
                ].map(([hex, lbl]) => (
                  <ColorSwatch key={hex} color={hex} label={`Gold ${lbl}`} hex={hex} />
                ))}
              </div>
            </div>

            {/* Text ramp */}
            <div>
              <Text variant="label" className="mb-3 block">Text Scale</Text>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ColorSwatch color="#F4F6FA" label="Primary"  hex="#F4F6FA" />
                <ColorSwatch color="#8892A0" label="Secondary" hex="#8892A0" />
                <ColorSwatch color="#525C6A" label="Muted"    hex="#525C6A" />
                <ColorSwatch color="#353D47" label="Disabled" hex="#353D47" />
              </div>
            </div>

            {/* Status */}
            <div>
              <Text variant="label" className="mb-3 block">Status Colors</Text>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <ColorSwatch color="#22C55E" label="Online"    hex="#22C55E" />
                <ColorSwatch color="#34D399" label="Available" hex="#34D399" />
                <ColorSwatch color="#60A5FA" label="Upcoming"  hex="#60A5FA" />
                <ColorSwatch color="#A78BFA" label="Completed" hex="#A78BFA" />
                <ColorSwatch color="#FBBF24" label="Pending"   hex="#FBBF24" />
                <ColorSwatch color="#6B7280" label="Offline"   hex="#6B7280" />
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            02 · TYPOGRAPHY
        ════════════════════════════════════════════════════════════ */}
        <Section id="type" label="02 · Foundations" title="Typography">
          <div className="space-y-10">

            {/* Type scale */}
            <div className="space-y-4">
              {(
                [
                  ['Display', 'text-7xl font-extrabold', 'Exchange Knowledge'],
                  ['H1',      'text-5xl font-extrabold', 'Find Your Perfect Swap'],
                  ['H2',      'text-3xl font-bold',      'Your Skill Network'],
                  ['H3',      'text-2xl font-bold',      'Recent Sessions'],
                  ['H4',      'text-xl font-semibold',   'Upcoming Swap'],
                  ['H5',      'text-base font-semibold', 'Photography · Expert'],
                ] as [string, string, string][]
              ).map(([label, cls, text]) => (
                <div key={label} className="flex items-baseline gap-6">
                  <span className="w-16 shrink-0 text-2xs text-text-muted font-mono uppercase tracking-widest">
                    {label}
                  </span>
                  <span className={`${cls} tracking-tight text-text-primary leading-none`}>{text}</span>
                </div>
              ))}
            </div>

            <Divider />

            {/* Body styles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Text variant="label" className="block">Body & UI Text</Text>
                <Text variant="lead">
                  Lead — Share what you know, learn what you don't. SkillSwap connects people through knowledge exchange.
                </Text>
                <Text variant="body">
                  Body — Discover people whose skills complement yours. Every swap is a session where real knowledge changes hands.
                </Text>
                <Text variant="small">Small — Sessions are 30–90 minutes long, scheduled at mutual convenience.</Text>
                <Text variant="muted">Muted — Last active 2 hours ago</Text>
                <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted">Label — Section Header</p>
              </div>

              <div className="space-y-4">
                <Text variant="label" className="block">Utilities</Text>
                <div className="space-y-3">
                  <div>
                    <Heading level="h3">
                      Exchange <Highlight color="purple">Knowledge</Highlight>,{' '}
                      Build <Highlight color="gold">Skills</Highlight>
                    </Heading>
                  </div>
                  <Callout icon="💡" variant="purple">
                    Skill DNA maps your expertise as an interactive network — hover any node to explore connections.
                  </Callout>
                  <Callout icon="⚡" variant="gold">
                    Gold is reserved for primary CTAs and important status highlights.
                  </Callout>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Code>rgba(139,92,246,0.35)</Code>
                    <Kbd>⌘K</Kbd>
                    <Kbd>Enter</Kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            03 · BUTTONS
        ════════════════════════════════════════════════════════════ */}
        <Section id="buttons" label="03 · Interaction" title="Buttons">
          <div className="space-y-8">

            {/* Variants */}
            <div>
              <Text variant="label" className="block mb-4">Variants</Text>
              <div className="flex flex-wrap gap-3 items-center">
                <CTAButton>Find My Swap →</CTAButton>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Text variant="label" className="block mb-4">Sizes</Text>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary"    size="sm">Small</Button>
                <Button variant="primary"    size="md">Medium</Button>
                <Button variant="primary"    size="lg">Large</Button>
                <Button variant="secondary"  size="sm">Small</Button>
                <Button variant="secondary"  size="md">Medium</Button>
                <Button variant="secondary"  size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <Text variant="label" className="block mb-4">States</Text>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary"   loading>Loading</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <IconButton label="Settings" variant="secondary">
                  <SettingsIcon />
                </IconButton>
                <IconButton label="Add" variant="ghost">
                  <PlusIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            04 · CARDS
        ════════════════════════════════════════════════════════════ */}
        <Section id="cards" label="04 · Surfaces" title="Cards">
          <div className="space-y-8">

            {/* Stats row */}
            <div>
              <Text variant="label" className="block mb-4">Stat Cards</Text>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Swaps Completed" value="24"    change="3 this week"  positive icon={<SwapIcon />} />
                <StatCard label="Skills Taught"   value="8"     change="2 new"        positive icon={<BookIcon />} />
                <StatCard label="Hours Exchanged" value="36h"   change="4h this week" positive icon={<ClockIcon />} />
                <StatCard label="Match Score"     value="94%"                                  icon={<StarIcon />} />
              </div>
            </div>

            {/* Match cards */}
            <div>
              <Text variant="label" className="block mb-4">Match Cards</Text>
              <div className="flex gap-4 overflow-x-auto pb-2 ss-scroll-x">
                <MatchCard
                  name="Ananya Krishnan" skills={['Photography', 'Lightroom']}
                  wantsToLearn={['Figma', 'UI Design']} matchPercent={94}
                  status="online" gradientIndex={0}
                />
                <MatchCard
                  name="Luca Moretti" skills={['React', 'TypeScript']}
                  wantsToLearn={['UI Design', 'Branding']} matchPercent={87}
                  status="available" gradientIndex={1}
                />
                <MatchCard
                  name="Priya Nair" skills={['Illustration', 'Procreate']}
                  wantsToLearn={['HTML / CSS', 'Figma']} matchPercent={81}
                  status="upcoming" gradientIndex={2}
                />
                <MatchCard
                  name="Kenji Yamamoto" skills={['3D', 'Blender']}
                  wantsToLearn={['Photography', 'Color Grading']} matchPercent={76}
                  status="offline" gradientIndex={3}
                />
              </div>
            </div>

            {/* Surface samples */}
            <div>
              <Text variant="label" className="block mb-4">Card Surfaces</Text>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="md">
                  <Text variant="label" className="block mb-2">Standard Card</Text>
                  <Text variant="small">Dark surface with 1px border and very subtle inner gradient. The default workhorse.</Text>
                </Card>
                <Card elevated padding="md">
                  <Text variant="label" className="block mb-2">Elevated Card</Text>
                  <Text variant="small">Slightly lighter background with stronger gradient. Used for focus or hierarchy.</Text>
                </Card>
                <Card elevated hoverable glow padding="md">
                  <Text variant="label" className="block mb-2">Interactive Card</Text>
                  <Text variant="small">Hover to see the lift + purple glow border. Used for clickable content cards.</Text>
                </Card>
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            05 · SKILL PILLS
        ════════════════════════════════════════════════════════════ */}
        <Section id="skills" label="05 · Skills" title="Skill Pills">
          <div className="space-y-8">

            <div>
              <Text variant="label" className="block mb-4">Level Variants (with icons)</Text>
              <div className="flex flex-wrap gap-3">
                <SkillPill skill="Figma"       level="expert"       />
                <SkillPill skill="UI Design"   level="advanced"     />
                <SkillPill skill="Photography" level="intermediate" />
                <SkillPill skill="HTML / CSS"  level="beginner"     />
              </div>
            </div>

            <div>
              <Text variant="label" className="block mb-4">Selectable (click to toggle)</Text>
              <SkillTagGroup skills={selectableSkills} onToggle={toggleSkill} />
              <Text variant="muted" className="mt-2 block">
                Selected: {[...selectedSkills].join(', ') || '—'}
              </Text>
            </div>

            <div>
              <Text variant="label" className="block mb-4">Removable</Text>
              <SkillTagGroup
                skills={demoSkills}
                removable
                onRemove={name => console.log('remove', name)}
              />
            </div>

            <div>
              <Text variant="label" className="block mb-4">Level Badges (standalone)</Text>
              <div className="flex flex-wrap gap-2">
                <LevelBadge level="expert"       />
                <LevelBadge level="advanced"     />
                <LevelBadge level="intermediate" />
                <LevelBadge level="beginner"     />
              </div>
            </div>

            <div>
              <Text variant="label" className="block mb-4">Sizes</Text>
              <div className="flex flex-wrap gap-2 items-center">
                <SkillPill skill="Figma" level="expert"       size="sm" />
                <SkillPill skill="Figma" level="expert"       size="md" />
                <SkillPill skill="Figma" level="expert" selected size="md" />
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            06 · STATUS BADGES
        ════════════════════════════════════════════════════════════ */}
        <Section id="badges" label="06 · Status" title="Status Badges">
          <div className="space-y-8">

            <div>
              <Text variant="label" className="block mb-4">Pill variant</Text>
              <div className="flex flex-wrap gap-3">
                {(['online','available','upcoming','completed','pending','offline'] as const).map(s => (
                  <StatusBadge key={s} status={s} variant="pill" />
                ))}
              </div>
            </div>

            <div>
              <Text variant="label" className="block mb-4">Tag variant</Text>
              <div className="flex flex-wrap gap-3">
                {(['online','available','upcoming','completed','pending','offline'] as const).map(s => (
                  <StatusBadge key={s} status={s} variant="tag" />
                ))}
              </div>
            </div>

            <div>
              <Text variant="label" className="block mb-4">Dot variant + Status Row</Text>
              <div className="flex flex-wrap gap-6">
                {(['online','available','upcoming','completed','pending'] as const).map(s => (
                  <StatusRow key={s} status={s} />
                ))}
              </div>
            </div>

            <div>
              <Text variant="label" className="block mb-4">Count Badge</Text>
              <div className="flex gap-4 items-center">
                <CountBadge count={3}   />
                <CountBadge count={12}  />
                <CountBadge count={100} />
                <span className="text-sm text-text-muted">Messages</span>
                <CountBadge count={5}   />
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            07 · FORM INPUTS
        ════════════════════════════════════════════════════════════ */}
        <Section id="forms" label="07 · Forms" title="Form Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-5">
              <SearchInput
                placeholder="Search skills, people…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
              />
              <Input label="Display Name" placeholder="Ananya Krishnan" />
              <Input
                label="Email"
                type="email"
                placeholder="hello@skillswap.app"
                iconLeft={<MailIcon />}
              />
              <Input
                label="Username"
                placeholder="@ananya"
                iconLeft={<AtIcon />}
                success
                hint="Username is available"
              />
              <Input
                label="Skill"
                placeholder="Enter a skill"
                error="Please enter at least one skill"
              />
            </div>

            <div className="space-y-5">
              <Textarea
                label="Bio"
                placeholder="Tell people what you know and what you'd love to learn…"
                maxChars={200}
                defaultValue=""
              />
              <Select
                label="Skill Level"
                options={[
                  { value: '',             label: 'Select level…'  },
                  { value: 'beginner',     label: '🌱 Beginner'     },
                  { value: 'intermediate', label: '⚡ Intermediate' },
                  { value: 'advanced',     label: '🔥 Advanced'     },
                  { value: 'expert',       label: '◆ Expert'        },
                ]}
              />
              <Select
                label="Session Duration"
                options={[
                  { value: '30',  label: '30 minutes'  },
                  { value: '45',  label: '45 minutes'  },
                  { value: '60',  label: '60 minutes ★' },
                  { value: '90',  label: '90 minutes'  },
                ]}
              />
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            08 · SKILL DNA
        ════════════════════════════════════════════════════════════ */}
        <Section id="skill-dna" label="08 · Signature Feature" title="Skill DNA Network">
          <div className="flex flex-col items-center gap-6">
            <Text variant="lead" className="text-center max-w-xl">
              The user sits at the center. Teaching skills glow{' '}
              <Highlight color="purple">purple</Highlight>. Learning skills pulse{' '}
              <Highlight color="gold">gold</Highlight>. Hover any node to reveal details.
            </Text>

            <div
              className="rounded-2xl p-4 sm:p-8 w-full max-w-lg mx-auto flex justify-center"
              style={{
                background: '#0C1017',
                border:     '1px solid rgba(255,255,255,0.07)',
                boxShadow:  '0 0 60px rgba(139,92,246,0.10)',
              }}
            >
              <SkillDNA size={380} animated />
            </div>

            <Text variant="muted" className="text-center text-xs">
              Node size reflects skill level · Hover to expand · Purple = Teaches · Gold = Learning
            </Text>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            09 · PERFECT SWAP
        ════════════════════════════════════════════════════════════ */}
        <Section id="perfect-swap" label="09 · Signature Moment" title="Perfect Swap">
          <div className="flex flex-col items-center gap-6">
            <Text variant="lead" className="text-center max-w-xl">
              The signature interaction — two people, two complementary skills,
              one animated connection that says{' '}
              <Highlight color="purple">"you have what they need"</Highlight>.
            </Text>

            <div className="w-full max-w-sm mx-auto">
              <PerfectSwap
                matchPercent={94}
                duration="60 MIN"
                you={{
                  name:       'You',
                  skill:      'Figma',
                  level:      'expert',
                  initials:   'YO',
                  colorIndex: 0,
                }}
                them={{
                  name:       'Ananya',
                  skill:      'Photography',
                  level:      'expert',
                  initials:   'AK',
                  colorIndex: 2,
                }}
                onAccept={() => alert('Swap accepted!')}
                onDecline={() => alert('Swap passed')}
              />
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            10 · LOCKED / EMPTY STATES
        ════════════════════════════════════════════════════════════ */}
        <Section id="locked" label="10 · Empty States" title="Locked & Coming Soon">
          <div className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LockedFeature
                title="Smart Skill Recommendations"
                description="Discover skills based on your Skill DNA and community trends."
                phase={6}
                icon="🧠"
              />
              <LockedFeature
                title="AI Swap Coach"
                description="Get personalised coaching tips before and after each swap session."
                phase={7}
                icon="🤖"
              />
              <LockedFeature
                title="Skill Marketplace"
                description="Offer skill packs and mini-courses to the wider SkillSwap community."
                phase={8}
                icon="🏪"
              />
            </div>

            <div>
              <Text variant="label" className="block mb-3">Inline Locked</Text>
              <div className="flex flex-wrap gap-2">
                <InlineLocked label="Advanced Analytics" />
                <InlineLocked label="Team Swaps" />
                <InlineLocked label="API Access" />
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            11 · GLASS SURFACES & UTILITIES
        ════════════════════════════════════════════════════════════ */}
        <Section id="surfaces" label="11 · Surfaces" title="Glass & Depth">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-5">
              <Text variant="label" className="block mb-2">Glass</Text>
              <Text variant="small">75% opacity dark background with 16px backdrop blur. Used for nav, overlays, tooltips.</Text>
            </div>
            <div className="glass-light rounded-xl p-5">
              <Text variant="label" className="block mb-2">Glass Light</Text>
              <Text variant="small">60% opacity, 12px blur. Lighter variant for secondary overlays and drawers.</Text>
            </div>
            <div className="glass-purple rounded-xl p-5">
              <Text variant="label" className="block mb-2">Glass Purple</Text>
              <Text variant="small">7% purple tint with purple border. Used for active states and highlighted panels.</Text>
            </div>
          </div>

          {/* Shadows */}
          <div className="mt-8">
            <Text variant="label" className="block mb-4">Depth Shadows</Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Card',           cls: 'shadow-card',          bg: '#11151D' },
                { label: 'Card Elevated',  cls: 'shadow-card-elevated', bg: '#151A24' },
                { label: 'Purple SM',      cls: 'shadow-purple-sm',     bg: '#11151D' },
                { label: 'Purple LG',      cls: 'shadow-purple-lg',     bg: '#151A24' },
              ].map(({ label, cls, bg }) => (
                <div
                  key={label}
                  className={`h-16 rounded-xl flex items-center justify-center ${cls}`}
                  style={{ background: bg, border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Text variant="muted" className="text-xs">{label}</Text>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ════════════════════════════════════════════════════════════
            12 · ANIMATION TOKENS
        ════════════════════════════════════════════════════════════ */}
        <Section id="motion" label="12 · Motion" title="Animation Tokens">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Fade In',     cls: 'animate-fade-in',      bg: '#11151D' },
              { label: 'Glow Pulse',  cls: 'animate-glow-pulse',   bg: '#151A24' },
              { label: 'Float',       cls: 'animate-float',        bg: '#11151D' },
              { label: 'Shimmer',     cls: 'shimmer',              bg: '#151A24' },
            ].map(({ label, cls, bg }) => (
              <div
                key={label}
                className={`h-16 rounded-xl flex items-center justify-center ${cls}`}
                style={{ background: bg, border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Text variant="muted" className="text-xs">{label}</Text>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Text variant="label" className="block mb-3">Framer Motion Entrance</Text>
            <div className="flex flex-wrap gap-3">
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map(delay => (
                <motion.div
                  key={delay}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
                  className="h-12 w-20 rounded-xl flex items-center justify-center"
                  style={{ background: '#11151D', border: '1px solid rgba(139,92,246,0.18)' }}
                >
                  <span className="text-2xs text-text-muted font-mono">{delay}s</span>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer
          className="py-10 mt-8 text-center border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <Text variant="muted">
            SkillSwap Design System · Built with React, Vite, Tailwind CSS, Framer Motion
          </Text>
          <Text variant="muted" className="mt-1 text-xs">
            Plus Jakarta Sans · Dark mode only · All design tokens in{' '}
            <Code>tailwind.config.ts</Code>
          </Text>
        </footer>

      </main>
    </div>
  )
}

/* ─── Icon primitives ────────────────────────────────────────────────────── */
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function SwapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 5h9M8 2l3 3-3 3M14 11H5M8 14l-3-3 3-3"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3V2Z"
        stroke="currentColor" strokeWidth="1.4"/>
      <path d="M11 2h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1"
        stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 5h3M6 8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5L8 2Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 4l6.5 4L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function AtIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 7.5A2.5 2.5 0 0 0 10 10v1.5a2 2 0 0 0 4 0V7.5a6.5 6.5 0 1 0-2.5 5.2"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
