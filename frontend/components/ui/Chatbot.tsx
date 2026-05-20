'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { useStore } from '@/store/appStore'

interface Msg { role: 'bot' | 'user'; text: string }

const WELCOME = `Hi! I'm NEXZEN Assistant 👋\nAsk me about loans, customers, employees, or how to use the system.`

function buildReply(
  q: string,
  stats: { loans: number; customers: number; employees: number; pending: number; approved: number; disbursed: number }
): string {
  const t = q.toLowerCase()
  if (/hello|hi|hey/.test(t)) return 'Hello! How can I help you with NEXZEN LMS today?'
  if (/help/.test(t)) return 'I can help with:\n• Loan status & counts\n• Customer & employee info\n• Navigation guidance\nJust ask!'
  if (/how many loan|total loan|loan count/.test(t))
    return `There are ${stats.loans} loans total:\n• Pending: ${stats.pending}\n• Approved: ${stats.approved}\n• Disbursed: ${stats.disbursed}`
  if (/pending/.test(t)) return `${stats.pending} loan(s) are pending approval. Go to Loans → Loan Approval.`
  if (/approv/.test(t)) return `${stats.approved} loan(s) approved. Go to Loans → Loan Approval to approve pending ones.`
  if (/disburs/.test(t)) return `${stats.disbursed} loan(s) disbursed. View under Loans → Disbursed Loan List.`
  if (/customer/.test(t)) return `${stats.customers} customers registered. Manage under Customer menu.`
  if (/employee/.test(t)) return `${stats.employees} employees in the system. Manage under Employee menu.`
  if (/add loan/.test(t)) return 'Go to Loans → Add Loan from the sidebar.'
  if (/add customer/.test(t)) return 'Go to Customer → Add Customer from the sidebar.'
  if (/add employee/.test(t)) return 'Go to Employee → Add Employee from the sidebar.'
  if (/master/.test(t)) return 'Master data: States, Cities, Areas, Branches, Loan Types, Banks — all under the Master menu.'
  if (/login|password|credential/.test(t))
    return 'Demo credentials:\n• admin / admin123\n• employee / emp123\n• approver / apr123'
  return "I'm not sure about that. Try asking about loans, customers, employees, or navigation."
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: WELCOME }])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { loans, customers, employees } = useStore()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100) }, [open])

  const sendText = (text: string) => {
    if (!text.trim()) return
    const stats = {
      loans: loans.length, customers: customers.length, employees: employees.length,
      pending: loans.filter(l => l.status === 'pending').length,
      approved: loans.filter(l => l.status === 'approved').length,
      disbursed: loans.filter(l => l.status === 'disbursed').length,
    }
    setMsgs(m => [...m, { role: 'user', text }, { role: 'bot', text: buildReply(text, stats) }])
  }

  const send = () => { const text = input.trim(); if (!text) return; sendText(text); setInput('') }

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(p => !p)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 text-white rounded-full shadow-xl flex items-center justify-center transition-colors cursor-pointer"
        style={{ background: 'var(--accent)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        title="Chat with NEXZEN Assistant">
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 text-white"
            style={{ background: 'var(--accent)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">NEXZEN Assistant</div>
              <div className="text-xs opacity-75 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--success)' }} />
                Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer"><X size={16} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72"
            style={{ background: 'var(--surface)' }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: m.role === 'bot' ? 'var(--accent-tint)' : 'var(--hover)' }}>
                  {m.role === 'bot'
                    ? <Bot size={12} style={{ color: 'var(--accent)' }} />
                    : <User size={12} style={{ color: 'var(--text-secondary)' }} />}
                </div>
                <div className="text-xs px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-line leading-relaxed"
                  style={m.role === 'bot'
                    ? { background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderTopLeftRadius: 4 }
                    : { background: 'var(--accent)', color: '#fff', borderTopRightRadius: 4 }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            {['Loan count', 'Pending loans', 'Add customer'].map(s => (
              <button key={s} onClick={() => sendText(s)}
                className="text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors shrink-0"
                style={{ background: 'var(--hover)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-tint)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask something..."
              className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
              style={{ background: 'var(--form-field)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-tint)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button onClick={send}
              className="w-8 h-8 text-white rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
