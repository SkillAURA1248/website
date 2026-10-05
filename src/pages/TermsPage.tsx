import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using SkillSwap, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you may not use our platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of the revised terms.`,
  },
  {
    title: '2. Description of Service',
    body: `SkillSwap is a peer-to-peer skill exchange platform that allows users to teach skills they know in exchange for learning skills from others. SkillSwap does not facilitate monetary transactions between users. All exchanges are based on mutual skill sharing agreements between users.`,
  },
  {
    title: '3. User Accounts',
    body: `You must be at least 16 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate, current, and complete information during registration.`,
  },
  {
    title: '4. User Conduct',
    body: `You agree not to use SkillSwap to: (a) post false or misleading skill information; (b) harass, abuse, or harm other users; (c) impersonate any person or entity; (d) distribute spam or unsolicited messages; (e) engage in any activity that disrupts the platform; (f) violate any applicable laws or regulations.`,
  },
  {
    title: '5. Skill Exchange Agreements',
    body: `SkillSwap facilitates connections between users but is not a party to any skill exchange agreement. Users are solely responsible for the terms, quality, and fulfillment of their skill exchange arrangements. SkillSwap does not guarantee the quality or accuracy of skills offered or requested by users.`,
  },
  {
    title: '6. Content Ownership',
    body: `You retain ownership of any content you submit to SkillSwap. By submitting content, you grant SkillSwap a worldwide, non-exclusive, royalty-free license to use, display, and distribute such content solely for the purpose of operating and improving the platform.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `SkillSwap is provided "as is" without warranties of any kind. To the fullest extent permitted by law, SkillSwap shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.`,
  },
  {
    title: '8. Termination',
    body: `We reserve the right to suspend or terminate your account at our sole discretion for conduct that violates these Terms. You may delete your account at any time from the Settings page.`,
  },
  {
    title: '9. Governing Law',
    body: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation, and if necessary, through binding arbitration.`,
  },
  {
    title: '10. Contact',
    body: `If you have any questions about these Terms, please contact us through the SkillSwap platform or via our official support channels.`,
  },
]

export default function TermsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen" style={{ background: '#07090D' }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(139,92,246,0.10) 0%,transparent 65%)' }} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-10 transition-colors">
          <ArrowLeft size={16} /> Back
        </motion.button>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="8" cy="10" r="3.5" fill="#8B5CF6" fillOpacity="0.9" />
              <circle cx="16" cy="10" r="3.5" fill="#FBBF24" fillOpacity="0.9" />
              <path d="M11 10 L13 10" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
              <circle cx="12" cy="16" r="2" fill="#ffffff" fillOpacity="0.25" />
            </svg>
            <span className="text-lg font-bold text-white">Skill<span className="text-purple-400">Swap</span></span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Terms and Conditions</h1>
          <p className="text-white/40 text-sm">Last updated: January 2025</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 border mb-6"
          style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)' }}>
          <p className="text-white/70 text-sm leading-relaxed">
            Welcome to SkillSwap. These Terms and Conditions govern your use of our platform.
            Please read them carefully before creating an account.
          </p>
        </motion.div>
        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <motion.div key={section.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="rounded-2xl p-6 border"
              style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-base font-bold text-white mb-3">{section.title}</h2>
              <p className="text-white/55 text-sm leading-relaxed">{section.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 text-center">
          <button onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-[#07090D] transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)', boxShadow: '0 0 20px rgba(251,191,36,0.25)' }}>
            Back to Sign Up
          </button>
        </motion.div>
      </div>
    </div>
  )
}
