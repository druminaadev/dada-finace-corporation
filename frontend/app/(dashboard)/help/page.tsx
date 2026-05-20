'use client'
import { useState } from 'react'
import { 
  Search, Book, MessageCircle, Mail, Phone, Video, 
  HelpCircle, ChevronDown, Send, FileText, Zap, Users,
  CheckCircle
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const quickLinks = [
  { icon: Book, label: 'Documentation', description: 'Complete user guide', color: '#462C7D' },
  { icon: Video, label: 'Video Tutorials', description: 'Step-by-step videos', color: '#831C91' },
  { icon: FileText, label: 'Release Notes', description: 'Latest updates', color: '#D552A3' },
  { icon: Users, label: 'Community', description: 'Join discussions', color: '#462C7D' },
]

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    color: '#10B981',
    questions: [
      { 
        q: 'How do I add a new customer?', 
        a: 'Navigate to Customers > Add Customer from the sidebar. Fill in the required information including name, contact details, and address. Click Save to create the customer profile.' 
      },
      { 
        q: 'How do I create a loan application?', 
        a: 'Go to Loans > Add Loan. Select the customer, enter loan amount, interest rate, tenure, and other details. Submit for approval.' 
      },
      { 
        q: 'How do I approve a loan?', 
        a: 'Navigate to Loans > Pending Approval. Review the loan details and click Approve or Reject based on your assessment.' 
      },
    ]
  },
  {
    category: 'EMI & Payments',
    icon: CheckCircle,
    color: '#3B82F6',
    questions: [
      { 
        q: 'How do I collect EMI payments?', 
        a: 'Go to EMI > EMI Collection. Search for the customer, select the loan, enter the payment amount, and choose the payment method. Click Submit to record the payment.' 
      },
      { 
        q: 'How do I view EMI schedule?', 
        a: 'Navigate to EMI > EMI Calendar to view all upcoming and overdue EMI payments in a calendar format.' 
      },
      { 
        q: 'What happens if a customer misses an EMI?', 
        a: 'The system automatically marks it as overdue and sends notifications. You can view all overdue payments in Reports > Outstanding Dues.' 
      },
    ]
  },
  {
    category: 'Reports & Analytics',
    icon: FileText,
    color: '#F59E0B',
    questions: [
      { 
        q: 'How do I generate reports?', 
        a: 'Navigate to Reports section and select the type of report you need. Apply filters for date range, branch, or employee. Click Generate to view or download the report.' 
      },
      { 
        q: 'Can I export data to Excel?', 
        a: 'Yes, most reports and tables have an export option. Click the download icon and select your preferred format (Excel, PDF, or CSV).' 
      },
    ]
  },
  {
    category: 'Account & Settings',
    icon: Users,
    color: '#8B5CF6',
    questions: [
      { 
        q: 'How do I change my password?', 
        a: 'Go to Settings > Security. Enter your current password, then your new password twice. Click Update Password to save changes.' 
      },
      { 
        q: 'How do I manage notification preferences?', 
        a: 'Navigate to Settings > Notifications. Toggle the switches for different notification types based on your preferences.' 
      },
    ]
  },
]

export default function HelpPage() {
  const { showToast } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    message: '',
  })

  const handleSubmitTicket = () => {
    if (!supportForm.name || !supportForm.email || !supportForm.subject || !supportForm.message) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    showToast('Support ticket submitted successfully! We\'ll respond within 24 hours.', 'success')
    setSupportForm({ name: '', email: '', subject: '', priority: 'medium', message: '' })
  }

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1e293b' }}>Help & Support</h1>
        <p className="text-slate-500">We are here to help you get the most out of NEXZEN</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 text-base rounded-xl border-2 border-slate-200 bg-white text-slate-700 outline-none transition-all shadow-sm"
            style={{
              borderColor: searchQuery ? '#462C7D' : '#e2e8f0',
              boxShadow: searchQuery ? '0 0 0 4px rgba(70, 44, 125, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.label}
              className="group p-6 bg-white rounded-xl border transition-all text-left"
              style={{ borderColor: '#e2e8f0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = link.color
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 8px 24px ${link.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all"
                style={{ background: `${link.color}15` }}
              >
                <Icon size={24} style={{ color: link.color }} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: '#1e293b' }}>{link.label}</h3>
              <p className="text-sm text-slate-500">{link.description}</p>
            </button>
          )
        })}
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1e293b' }}>Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFaqs.map((category) => {
            const CategoryIcon = category.icon
            return (
              <div key={category.category} className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e2e8f0' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${category.color}15` }}
                  >
                    <CategoryIcon size={20} style={{ color: category.color }} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: '#1e293b' }}>{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.questions.map((faq, idx) => {
                    const isExpanded = expandedFaq === `${category.category}-${idx}`
                    return (
                      <div
                        key={idx}
                        className="border rounded-lg overflow-hidden"
                        style={{ borderColor: '#e2e8f0' }}
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : `${category.category}-${idx}`)}
                          className="w-full flex items-start gap-3 p-4 text-left transition-colors"
                          style={{ background: isExpanded ? '#f8fafc' : 'white' }}
                          onMouseEnter={(e) => !isExpanded && (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={(e) => !isExpanded && (e.currentTarget.style.background = 'white')}
                        >
                          <ChevronDown
                            size={18}
                            className="flex-shrink-0 mt-0.5 transition-transform"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              color: '#462C7D'
                            }}
                          />
                          <span className="flex-1 text-sm font-medium" style={{ color: '#1e293b' }}>
                            {faq.q}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pl-11" style={{ background: '#f8fafc' }}>
                            <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact Methods */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1e293b' }}>Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: '#e2e8f0' }}>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}
            >
              <Phone size={32} style={{ color: '#10B981' }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: '#1e293b' }}>Phone Support</h3>
            <p className="text-lg font-bold mb-1" style={{ color: '#10B981' }}>+91 98765 43210</p>
            <p className="text-sm text-slate-500">Mon-Fri, 9AM-6PM IST</p>
          </div>

          <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: '#e2e8f0' }}>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(59, 130, 246, 0.1)' }}
            >
              <Mail size={32} style={{ color: '#3B82F6' }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: '#1e293b' }}>Email Support</h3>
            <p className="text-lg font-bold mb-1" style={{ color: '#3B82F6' }}>support@nexzen.com</p>
            <p className="text-sm text-slate-500">Response within 24 hours</p>
          </div>

          <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: '#e2e8f0' }}>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(139, 92, 246, 0.1)' }}
            >
              <MessageCircle size={32} style={{ color: '#8B5CF6' }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: '#1e293b' }}>Live Chat</h3>
            <p className="text-lg font-bold mb-1" style={{ color: '#8B5CF6' }}>Start Chat</p>
            <p className="text-sm text-slate-500">Available now</p>
          </div>
        </div>
      </div>

      {/* Submit Ticket */}
      <div className="bg-white rounded-xl p-8 border" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(70, 44, 125, 0.1)' }}
          >
            <Send size={28} style={{ color: '#462C7D' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Submit a Support Ticket</h2>
            <p className="text-slate-500">Cannot find what you are looking for? We are here to help</p>
          </div>
        </div>

        <div className="max-w-3xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>
                Your Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={supportForm.name}
                onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#e2e8f0' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="email"
                value={supportForm.email}
                onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#e2e8f0' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>
                Subject <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#e2e8f0' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Priority</label>
              <select
                value={supportForm.priority}
                onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#e2e8f0' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>
              Message <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={supportForm.message}
              onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
              placeholder="Describe your issue in detail..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-all resize-none"
              style={{ borderColor: '#e2e8f0' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitTicket}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #462C7D, #831C91)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Send size={18} />
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
