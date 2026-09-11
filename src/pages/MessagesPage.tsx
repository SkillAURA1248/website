import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth'
import { getThreads, getMessages, sendMessage } from '../lib/data'
import type { Thread, Message } from '../lib/types'

const GRADIENTS = [
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
]

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function MessagesPage() {
  const { profile: me, profileId: myProfileId } = useAuth()
  const [threads,       setThreads]       = useState<Thread[]>([])
  const [activeThread,  setActiveThread]  = useState<Thread | null>(null)
  const [messages,      setMessages]      = useState<Message[]>([])
  const [input,         setInput]         = useState('')
  const [search,        setSearch]        = useState('')
  const [loadingThreads,setLoadingThreads]= useState(true)
  const [loadingMsgs,   setLoadingMsgs]   = useState(false)
  const [sending,       setSending]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load threads
  useEffect(() => {
    getThreads().then(t => {
      setThreads(t)
      if (t.length > 0 && !activeThread) selectThread(t[0], false)
      setLoadingThreads(false)
    })
  }, [])

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selectThread = (thread: Thread, fromUser = true) => {
    setActiveThread(thread)
    setLoadingMsgs(true)
    getMessages(thread.id).then(m => {
      setMessages(m)
      setLoadingMsgs(false)
    })
  }

  const handleSend = async () => {
    if (!input.trim() || !activeThread || !myProfileId) return
    setSending(true)
    const msg = await sendMessage(activeThread.id, input.trim(), myProfileId)
    if (msg) setMessages(prev => [...prev, msg])
    setInput('')
    setSending(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const otherUser = (thread: Thread) =>
    thread.participants.find(p => p.id !== myProfileId) ?? thread.participants[0]

  const filteredThreads = threads.filter(t => {
    if (!search) return true
    const other = otherUser(t)
    return other?.displayName.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Thread list */}
        <div
          className={`${activeThread ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r`}
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0C1017' }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: '#11151D', borderColor: 'rgba(255,255,255,0.06)' }}>
              <Search size={14} className="text-white/30 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="text-purple-400 animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm px-4">
                No conversations yet. Go to Discover to find a match!
              </div>
            ) : filteredThreads.map(thread => {
              const other    = otherUser(thread)
              const isActive = activeThread?.id === thread.id
              return (
                <button key={thread.id} onClick={() => selectThread(thread)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.03]"
                  style={{ background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent' }}>
                  {other?.avatarUrl ? (
                    <img src={other.avatarUrl} alt={other.displayName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: GRADIENTS[(other?.gradientIndex ?? 0) % 5] }}>
                      {(other?.displayName ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white truncate">{other?.displayName}</span>
                      {thread.updatedAt && (
                        <span className="text-xs text-white/30 shrink-0 ml-2">{timeAgo(thread.updatedAt)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-white/40 truncate">{thread.lastMessage?.content ?? 'No messages yet'}</p>
                      {thread.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 text-white"
                          style={{ background: '#8B5CF6' }}>
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat panel */}
        {activeThread ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="h-14 px-4 flex items-center gap-3 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button onClick={() => setActiveThread(null)} className="md:hidden text-white/40 hover:text-white mr-1">←</button>
              {(() => {
                const other = otherUser(activeThread)
                return (
                  <>
                    {other?.avatarUrl ? (
                      <img src={other.avatarUrl} alt={other.displayName}
                        className="w-8 h-8 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: GRADIENTS[(other?.gradientIndex ?? 0) % 5] }}>
                        {(other?.displayName ?? '?').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-white">{other?.displayName}</div>
                      <div className="text-xs text-white/30">
                        {other?.status === 'online' ? '🟢 Online' : 'Offline'}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={20} className="text-purple-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/30 text-sm">Start the conversation!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMine = msg.senderId === myProfileId
                    return (
                      <motion.div key={msg.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                          style={isMine
                            ? { background: '#8B5CF6', color: '#fff', borderBottomRightRadius: 4 }
                            : { background: '#151A24', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }
                          }>
                          {msg.content}
                          <div className="text-xs mt-1" style={{ color: isMine ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
                            {timeAgo(msg.createdAt)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t flex items-end gap-3"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Type a message…" rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none resize-none py-2"
                style={{ maxHeight: 120 }} />
              <button onClick={handleSend} disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{ background: input.trim() ? '#8B5CF6' : 'rgba(139,92,246,0.2)' }}>
                {sending ? <Loader2 size={15} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center text-white/30">
              <p className="text-lg font-semibold mb-2">Select a conversation</p>
              <p className="text-sm">Choose a thread on the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
