'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles, Ticket } from 'lucide-react'
import { useStore } from '@/store/appStore'

interface Msg {
  role: 'bot' | 'user'
  text: string
  isTicketPrompt?: boolean
  isTicketForm?: boolean
}

interface Ticket {
  id: string
  subject: string
  description: string
  raisedAt: string
}

const WELCOME = `Hi! I'm NEXZEN Assistant 👋\nAsk me about loans, customers, employees, branches, banks, loan types, or how to use the system.\n\nType "help" to see all topics.`

// ── Quick suggestions per context ────────────────────────────
const SUGGESTIONS = ['Loan count', 'Pending loans', 'Customers', 'Employees', 'Branches', 'Loan types']

function genTicketId() {
  return 'TKT-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function buildReply(
  q: string,
  store: ReturnType<typeof useStore.getState>
): { text: string; isTicketPrompt?: boolean } {
  const t = q.toLowerCase().trim()

  const { loans, customers, employees, branches, banks, loanTypes, states, cities, areas, emis } = store

  // ── Greetings ──
  if (/^(hello|hi|hey|good\s*(morning|evening|afternoon))/.test(t))
    return { text: 'Hello! How can I help you with NEXZEN LMS today? Type "help" to see available topics.' }

  // ── Help ──
  if (/\bhelp\b/.test(t))
    return {
      text:
        'I can help with:\n• Loan counts & status\n• Customer details\n• Employee info\n• Branch & bank details\n• Loan types & EMI info\n• Navigation guidance\n• Raise a support ticket\n\nJust ask naturally!',
    }

  // ── LOAN stats ──
  if (/how many loan|total loan|loan count|number of loan/.test(t)) {
    const p = loans.filter(l => l.status === 'pending').length
    const a = loans.filter(l => l.status === 'approved').length
    const d = loans.filter(l => l.status === 'disbursed').length
    return { text: `Total loans: ${loans.length}\n• Pending: ${p}\n• Approved: ${a}\n• Disbursed: ${d}` }
  }

  if (/pending loan/.test(t)) {
    const list = loans.filter(l => l.status === 'pending')
    const names = list.map(l => {
      const c = customers.find(x => x.id === l.customerId)
      return `  - ${l.loanNo} | ${c?.name ?? 'Unknown'} | ₹${l.amount.toLocaleString()}`
    })
    return {
      text: `${list.length} pending loan(s):\n${names.join('\n') || '  None'}\n\nGo to Loans → Loan Approval.`,
    }
  }

  if (/approved loan/.test(t)) {
    const list = loans.filter(l => l.status === 'approved')
    const names = list.map(l => {
      const c = customers.find(x => x.id === l.customerId)
      return `  - ${l.loanNo} | ${c?.name ?? 'Unknown'} | ₹${l.amount.toLocaleString()}`
    })
    return {
      text: `${list.length} approved loan(s):\n${names.join('\n') || '  None'}`,
    }
  }

  if (/disburs/.test(t)) {
    const list = loans.filter(l => l.status === 'disbursed')
    return { text: `${list.length} loan(s) disbursed. View under Loans → Disbursed Loan List.` }
  }

  // ── Specific loan lookup ──
  const loanMatch = t.match(/loan\s*(no|number|#)?\s*(ln\d+)/i)
  if (loanMatch) {
    const ln = loanMatch[2].toUpperCase()
    const loan = loans.find(l => l.loanNo.toUpperCase() === ln)
    if (loan) {
      const c = customers.find(x => x.id === loan.customerId)
      const lt = loanTypes.find(x => x.id === loan.loanTypeId)
      return {
        text: `Loan ${loan.loanNo}:\n• Customer: ${c?.name ?? 'N/A'}\n• Amount: ₹${loan.amount.toLocaleString()}\n• Status: ${loan.status}\n• Type: ${lt?.name ?? 'N/A'}\n• Installments: ${loan.installments}\n• Rate: ${loan.interestRate}%`,
      }
    }
    return { text: `No loan found with number ${ln}.` }
  }

  // ── Total loan amount ──
  if (/total.*amount|loan.*amount|portfolio/.test(t)) {
    const total = loans.reduce((s, l) => s + l.amount, 0)
    const disbTotal = loans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)
    return { text: `Total loan portfolio: ₹${total.toLocaleString()}\nDisbursed amount: ₹${disbTotal.toLocaleString()}` }
  }

  // ── CUSTOMER stats ──
  if (/customer/.test(t) && /how many|total|count/.test(t))
    return { text: `${customers.length} customers registered. Manage under Customer menu.` }

  if (/customer/.test(t)) {
    // lookup by name first
    const custNameMatch = customers.find(c => t.includes(c.name.toLowerCase()))
    if (custNameMatch) {
      const cLoans = loans.filter(l => l.customerId === custNameMatch.id)
      return {
        text: `Customer: ${custNameMatch.name}\n• App No: ${custNameMatch.appNo}\n• Mobile: ${custNameMatch.mobile}\n• Occupation: ${custNameMatch.occupation}\n• Loans: ${cLoans.length} (${cLoans.map(l => `${l.loanNo}/${l.status}`).join(', ') || 'None'})`,
      }
    }
    // otherwise show full list
    const names = customers.map(c => `  - ${c.appNo} | ${c.name} | ${c.mobile}`).join('\n')
    return { text: `Registered customers (${customers.length}):\n${names}` }
  }

  // ── EMPLOYEE stats ──
  if (/employee/.test(t) && /how many|total|count/.test(t))
    return { text: `${employees.length} employees in the system. Manage under Employee menu.` }

  if (/employee/.test(t)) {
    // lookup by name first
    const empNameMatch = employees.find(e => t.includes(e.name.toLowerCase()))
    if (empNameMatch) {
      const br = branches.find(b => b.id === empNameMatch.branchId)
      const empLoans = loans.filter(l => l.employeeId === empNameMatch.id)
      return {
        text: `Employee: ${empNameMatch.name}\n• Code: ${empNameMatch.code}\n• Role: ${empNameMatch.role}\n• Branch: ${br?.name ?? 'N/A'}\n• Contact: ${empNameMatch.contact}\n• Loans handled: ${empLoans.length}`,
      }
    }
    // otherwise show full list
    const names = employees.map(e => `  - ${e.code} | ${e.name} | ${e.role} | ${e.contact}`).join('\n')
    return { text: `Employees (${employees.length}):\n${names}` }
  }

  // ── BRANCH ──
  if (/branch/.test(t)) {
    if (/how many|total|count/.test(t))
      return { text: `${branches.length} branches: ${branches.map(b => b.name).join(', ')}` }
    const names = branches.map(b => `  - ${b.name}: ${b.address}`).join('\n')
    return { text: `Branches (${branches.length}):\n${names}` }
  }

  // ── BANK ──
  if (/bank/.test(t)) {
    if (/how many|total|count/.test(t))
      return { text: `${banks.length} banks configured.` }
    const names = banks.map(b => `  - ${b.name}`).join('\n')
    return { text: `Banks (${banks.length}):\n${names}` }
  }

  // ── LOAN TYPES ──
  if (/loan type|types of loan/.test(t)) {
    const list = loanTypes.map(lt => `  - ${lt.name}: ${lt.description}`).join('\n')
    return { text: `Loan Types (${loanTypes.length}):\n${list}` }
  }

  // ── EMI ──
  if (/emi/.test(t)) {
    const overdue = emis.filter(e => e.status === 'overdue').length
    const paid = emis.filter(e => e.status === 'paid' || e.status === 'paid_late').length
    const upcoming = emis.filter(e => e.status === 'upcoming').length
    return {
      text: `EMI Summary:\n• Total: ${emis.length}\n• Overdue: ${overdue}\n• Paid: ${paid}\n• Upcoming: ${upcoming}\n\nView under EMI menu.`,
    }
  }

  // ── States / Cities ──
  if (/state/.test(t))
    return { text: `States (${states.length}): ${states.map(s => s.name).join(', ')}` }
  if (/cit/.test(t))
    return { text: `Cities (${cities.length}): ${cities.map(c => c.name).join(', ')}` }
  if (/area/.test(t))
    return { text: `Areas (${areas.length}): ${areas.map(a => a.name).join(', ')}` }

  // ── Navigation shortcuts ──
  if (/add loan|new loan|create loan/.test(t)) return { text: 'Go to Loans → Add Loan from the sidebar.' }
  if (/add customer|new customer/.test(t)) return { text: 'Go to Customer → Add Customer from the sidebar.' }
  if (/add employee|new employee/.test(t)) return { text: 'Go to Employee → Add Employee from the sidebar.' }
  if (/master/.test(t))
    return { text: 'Master data: States, Cities, Areas, Branches, Loan Types, Banks — all under the Master menu.' }
  if (/report/.test(t))
    return { text: 'Reports available: Daily Collection, Branch Performance, Employee Performance, Portfolio, Business Trend, Outstanding, Transaction History — under Reports menu.' }
  if (/civil score/.test(t))
    return { text: 'Civil Score tracks customer repayment behaviour. View under Civil Score menu. On-time EMI = +10, Late = -5 to -10.' }
  if (/setting/.test(t)) return { text: 'Access profile, security, notifications & more under the Settings menu.' }
  if (/login|password|credential/.test(t))
    return {
      text: 'Demo credentials:\n• admin / admin123\n• employee / emp123\n• approver / apr123',
    }

  // ── Unknown → offer ticket ──
  return {
    text: "I couldn't find an answer to that. Would you like to raise a support ticket to contact the developer team?",
    isTicketPrompt: true,
  }
}

// ── Typing loader ────────────────────────────────────────────
function TypingLoader() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent-tint)' }}>
        <Bot size={13} style={{ color: 'var(--accent)' }} />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTopLeftRadius: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', display: 'inline-block', animation: `chatbot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ── Ticket form ──────────────────────────────────────────────
function TicketForm({ onSubmit, onCancel }: { onSubmit: (subject: string, desc: string) => void; onCancel: () => void }) {
  const [subject, setSubject] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
        <Ticket size={13} /> Raise Support Ticket
      </div>
      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Subject (e.g. Login issue)"
        className="text-xs px-3 py-2 rounded-lg outline-none"
        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Describe your issue..."
        rows={3}
        className="text-xs px-3 py-2 rounded-lg outline-none resize-none"
        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => subject.trim() && desc.trim() && onSubmit(subject.trim(), desc.trim())}
          disabled={!subject.trim() || !desc.trim()}
          className="flex-1 text-xs py-2 rounded-lg font-medium text-white transition-all"
          style={{ background: subject.trim() && desc.trim() ? 'linear-gradient(135deg,var(--primary),var(--primary-light))' : 'var(--border)' }}
        >
          Submit Ticket
        </button>
        <button onClick={onCancel} className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--border)', color: 'var(--text-primary)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useStore()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading, showTicketForm])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120) }, [open])

  const sendText = (text: string) => {
    if (!text.trim() || loading) return
    setMsgs(m => [...m, { role: 'user', text }])
    setLoading(true)
    setTimeout(() => {
      const reply = buildReply(text, store)
      setMsgs(m => [...m, { role: 'bot', text: reply.text, isTicketPrompt: reply.isTicketPrompt }])
      setLoading(false)
    }, 700)
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    sendText(text)
  }

  const handleTicketSubmit = (subject: string, description: string) => {
    const ticket: Ticket = { id: genTicketId(), subject, description, raisedAt: new Date().toLocaleString() }
    setTickets(t => [...t, ticket])
    setShowTicketForm(false)
    setMsgs(m => [
      ...m,
      {
        role: 'bot',
        text: `✅ Ticket raised successfully!\n\nTicket ID: ${ticket.id}\nSubject: ${ticket.subject}\n\nOur developer team has been notified and will get back to you shortly. Reference this ID for follow-up.`,
      },
    ])
  }

  return (
    <>
      <style>{`
        @keyframes chatbot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chatbot-panel { animation: chatbot-slide-up 0.22s ease-out; }
        .chatbot-fab { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .chatbot-fab:hover { transform: scale(1.1); box-shadow: 0 8px 28px rgba(67,118,108,0.45); }
      `}</style>

      {/* FAB */}
      <button
        onClick={() => setOpen(p => !p)}
        className="chatbot-fab fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: open ? 'var(--primary-dark)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
          boxShadow: '0 4px 20px rgba(67,118,108,0.35)',
        }}
        title={open ? 'Close chat' : 'Chat with NEXZEN Assistant'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="chatbot-panel fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden"
          style={{ width: 420, maxHeight: 680, borderRadius: 20, background: 'var(--background)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(67,118,108,0.18)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-light) 100%)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white leading-tight">NEXZEN Assistant</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                <span className="text-[11px] text-white/70 font-medium">Online · AI powered</span>
              </div>
            </div>
            {tickets.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-white/80 bg-white/10 px-2 py-1 rounded-full">
                <Ticket size={10} /> {tickets.length} ticket{tickets.length > 1 ? 's' : ''}
              </div>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--surface)', maxHeight: 420 }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-2 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: m.role === 'bot' ? 'var(--accent-tint)' : 'var(--accent)' }}>
                    {m.role === 'bot' ? <Bot size={13} style={{ color: 'var(--accent)' }} /> : <User size={13} className="text-white" />}
                  </div>
                  <div
                    className="text-sm px-4 py-3 max-w-[78%] whitespace-pre-line leading-relaxed"
                    style={m.role === 'bot'
                      ? { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 4px rgba(118,69,59,0.06)' }
                      : { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: '#fff', borderRadius: '16px 16px 4px 16px', boxShadow: '0 2px 8px rgba(67,118,108,0.25)' }}
                  >
                    {m.text}
                  </div>
                </div>

                {/* Ticket prompt CTA */}
                {m.isTicketPrompt && !showTicketForm && (
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ml-9 transition-all"
                    style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 8px rgba(67,118,108,0.3)' }}
                  >
                    <Ticket size={12} /> Raise a Ticket
                  </button>
                )}
              </div>
            ))}

            {loading && <TypingLoader />}

            {/* Inline ticket form */}
            {showTicketForm && (
              <TicketForm
                onSubmit={handleTicketSubmit}
                onCancel={() => setShowTicketForm(false)}
              />
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto" style={{ borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendText(s)}
                disabled={loading}
                className="text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all shrink-0 font-medium"
                style={{ background: 'var(--accent-tint)', color: 'var(--accent)', border: '1px solid rgba(67,118,108,0.18)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-tint)'; e.currentTarget.style.color = 'var(--accent)' }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setShowTicketForm(true)}
              disabled={loading}
              className="text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all shrink-0 font-medium flex items-center gap-1"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444' }}
            >
              <Ticket size={10} /> Raise Ticket
            </button>
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask something..."
              disabled={loading}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl outline-none"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-tint)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-11 h-11 text-white rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all"
              style={{
                background: input.trim() && !loading ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' : 'var(--border)',
                boxShadow: input.trim() && !loading ? '0 3px 12px rgba(245,158,11,0.45)' : 'none',
              }}
              onMouseEnter={e => { if (input.trim() && !loading) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(239,68,68,0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = input.trim() && !loading ? '0 3px 12px rgba(245,158,11,0.45)' : 'none' }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
