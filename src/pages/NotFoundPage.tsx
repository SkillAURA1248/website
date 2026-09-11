import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#07090D' }}>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 30%,rgba(139,92,246,0.10) 0%,transparent 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        <div className="text-8xl font-black text-white/5 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/40 text-sm mb-8">
          This page doesn't exist yet. Maybe it's a skill you still need to learn?
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl text-sm font-bold text-[#07090D] transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg,#FBBF24,#F59E0B)',
            boxShadow: '0 0 20px rgba(251,191,36,0.3)',
          }}
        >
          ← Back to Home
        </button>
      </motion.div>
    </div>
  )
}
