import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly: your name, username, email address, and password (stored as a secure hash). We also collect skill information you add to your profile, messages you send through the platform, and usage data such as pages visited and features used.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to: (a) provide and improve the SkillSwap service; (b) match you with other users based on complementary skills; (c) send you notifications about matches, messages, and swap requests; (d) ensure platform security and prevent fraud; (e) analyse usage patterns to improve our features.`,
  },
  {
    title: '3. Information Sharing',
    body: `We do not sell your personal information to third parties. Your profile information (name, username, skills, location) is visible to other SkillSwap users. Your email address and password hash are never shared publicly. We may share data with service providers who help us operate the platform, under strict confidentiality agreements.`,
  },
  {
    title: '4. Data Storage and Security',
    body: `Your data is stored securely using Supabase infrastructure. Passwords are stored as cryptographic hashes and are never stored in plain text. We use industry-standard security measures including encrypted connections (HTTPS) to protect your data in transit and at rest.`,
  },
  {
    title: '5. Cookies and Local Storage',
    body: `SkillSwap uses browser localStorage to maintain your session (storing only your user ID). We do not use tracking cookies or third-party advertising cookies. You can clear your session at any time by signing out or clearing your browser data.`,
  },
  {
    title: '6. Your Rights',
    body: `You have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your account and associated data; (d) export your data. You can exercise these rights through the Settings page or by contacting us directly.`,
  },
  {
    title: '7. Data Retention',
    body: `We retain your account data for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal or regulatory reasons.`,
  },
  {
    title: '8. Children Privacy',
    body: `SkillSwap is not intended for users under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that a child under 16 has provided us with personal information, we will delete it immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of SkillSwap after changes constitutes acceptance of the revised policy.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have questions about this Privacy Policy or how we handle your data, please contact us through the SkillSwap platform. We are committed to resolving any privacy concerns promptly.`,
  },
]

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen" style={{ background: '#07090D' }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(251,191,36,0.07) 0%,transparent 65%)' }} />
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: January 2025</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 border mb-6"
          style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.15)' }}>
          <p className="text-white/70 text-sm leading-relaxed">
            Your privacy matters to us. This policy explains what data SkillSwap collects,
            how we use it, and the choices you have. We are committed to being transparent
            about our data practices.
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
