'use client'
import React, { useState, useEffect } from 'react'
import {
  Plus, Trash2, Edit, Filter, TrendingUp, PieChart as PieIcon,
  Calendar, Tag, Download, CreditCard, Search, Receipt,
  AlertCircle, DollarSign, Wallet, FileText, CheckCircle2,
  Clock, XCircle, Printer
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useUIStore } from '@/store/uiStore'

interface Expense {
  id: string
  date: string
  description: string
  category: string
  paymentMethod: string
  amount: number
  status: 'Pending' | 'Approved' | 'Rejected'
  merchant: string
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', date: '2026-06-01', description: 'Office Rent - June', category: 'Rent & Utilities', paymentMethod: 'Bank Transfer', amount: 45000, status: 'Approved', merchant: 'DLF Properties' },
  { id: 'exp-2', date: '2026-06-02', description: 'Cloud Servers Hosting', category: 'Software & IT', paymentMethod: 'Credit Card', amount: 12500, status: 'Approved', merchant: 'AWS' },
  { id: 'exp-3', date: '2026-06-05', description: 'Travel reimbursement - Client visit', category: 'Travel', paymentMethod: 'Bank Transfer', amount: 8400, status: 'Approved', merchant: 'Rahul Sharma' },
  { id: 'exp-4', date: '2026-06-10', description: 'Office Internet Connection', category: 'Rent & Utilities', paymentMethod: 'UPI', amount: 2500, status: 'Approved', merchant: 'Airtel Broadband' },
  { id: 'exp-5', date: '2026-06-12', description: 'Marketing materials printing', category: 'Marketing', paymentMethod: 'Cash', amount: 4200, status: 'Approved', merchant: 'QuickPrint' },
  { id: 'exp-6', date: '2026-06-15', description: 'Software CRM subscriptions', category: 'Software & IT', paymentMethod: 'Credit Card', amount: 15600, status: 'Pending', merchant: 'Salesforce' },
  { id: 'exp-7', date: '2026-06-18', description: 'Stationery and printer cartridges', category: 'Office Supplies', paymentMethod: 'UPI', amount: 1800, status: 'Approved', merchant: 'Stationery World' },
  { id: 'exp-8', date: '2026-06-20', description: 'Client Lunch - Negotiation', category: 'Meals & Entertainment', paymentMethod: 'Credit Card', amount: 5600, status: 'Pending', merchant: 'The Taj Pavilion' },
  { id: 'exp-9', date: '2026-06-21', description: 'AC Repair in Main Hall', category: 'Maintenance', paymentMethod: 'Cash', amount: 3500, status: 'Approved', merchant: 'Cooling Experts' },
]

const CATEGORIES = [
  'Rent & Utilities',
  'Software & IT',
  'Travel',
  'Marketing',
  'Office Supplies',
  'Meals & Entertainment',
  'Maintenance',
  'Salaries & Wages',
  'Miscellaneous'
]

const PAYMENT_METHODS = [
  'Bank Transfer',
  'UPI',
  'Credit Card',
  'Cash'
]

const STATUSES = ['Approved', 'Pending', 'Rejected']

// Category-wise colors aligned with NEXZEN Warm-Olive / Terracotta system
const CATEGORY_COLORS: Record<string, string> = {
  'Rent & Utilities': '#43766C',      // primary-base
  'Software & IT': '#5B9287',         // primary-light
  'Travel': '#B19470',                // secondary/accent
  'Marketing': '#D48C46',             // warning amber
  'Office Supplies': '#B83A3A',       // error crimson
  'Meals & Entertainment': '#76453B', // text-primary
  'Maintenance': '#8F5E54',           // text-secondary
  'Salaries & Wages': '#294A43',      // primary-dark
  'Miscellaneous': '#A87D74'          // text-muted
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { showToast } = useUIStore()

  // Form State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  const [formDescription, setFormDescription] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState(CATEGORIES[0])
  const [formPaymentMethod, setFormPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [formDate, setFormDate] = useState('')
  const [formMerchant, setFormMerchant] = useState('')
  const [formStatus, setFormStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Pending')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Budget state (Local persistence)
  const [budgetLimit, setBudgetLimit] = useState(150000)

  // Load / Persist data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nexzen-expenses')
      if (stored) {
        try {
          setExpenses(JSON.parse(stored))
        } catch {
          setExpenses(INITIAL_EXPENSES)
        }
      } else {
        setExpenses(INITIAL_EXPENSES)
        localStorage.setItem('nexzen-expenses', JSON.stringify(INITIAL_EXPENSES))
      }

      const storedBudget = localStorage.getItem('nexzen-expense-budget')
      if (storedBudget) {
        setBudgetLimit(Number(storedBudget))
      }
    }
  }, [])

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexzen-expenses', JSON.stringify(newExpenses))
    }
  }

  const handleOpenAdd = () => {
    setEditingExpense(null)
    setFormDescription('')
    setFormAmount('')
    setFormCategory(CATEGORIES[0])
    setFormPaymentMethod(PAYMENT_METHODS[0])
    setFormDate(new Date().toISOString().split('T')[0])
    setFormMerchant('')
    setFormStatus('Pending')
    setModalOpen(true)
  }

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp)
    setFormDescription(exp.description)
    setFormAmount(exp.amount.toString())
    setFormCategory(exp.category)
    setFormPaymentMethod(exp.paymentMethod)
    setFormDate(exp.date)
    setFormMerchant(exp.merchant)
    setFormStatus(exp.status)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      const filtered = expenses.filter(e => e.id !== id)
      saveExpenses(filtered)
      showToast('Expense record deleted successfully', 'success')
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedAmount = parseFloat(formAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid expense amount', 'error')
      return
    }

    if (!formDescription.trim()) {
      showToast('Please enter a valid description', 'error')
      return
    }

    if (!formMerchant.trim()) {
      showToast('Please enter a valid merchant / payee name', 'error')
      return
    }

    if (editingExpense) {
      // Editing
      const updated = expenses.map(item => 
        item.id === editingExpense.id 
          ? {
              ...item,
              description: formDescription.trim(),
              amount: parsedAmount,
              category: formCategory,
              paymentMethod: formPaymentMethod,
              date: formDate,
              merchant: formMerchant.trim(),
              status: formStatus
            }
          : item
      )
      saveExpenses(updated)
      showToast('Expense updated successfully', 'success')
    } else {
      // Adding
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        description: formDescription.trim(),
        amount: parsedAmount,
        category: formCategory,
        paymentMethod: formPaymentMethod,
        date: formDate,
        merchant: formMerchant.trim(),
        status: formStatus
      }
      saveExpenses([newExp, ...expenses])
      showToast('Expense recorded successfully', 'success')
    }

    setModalOpen(false)
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (!isNaN(val) && val >= 0) {
      setBudgetLimit(val)
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexzen-expense-budget', val.toString())
      }
    }
  }

  // Derived metrics
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  
  const approvedExpenses = expenses
    .filter(e => e.status === 'Approved')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const pendingExpenses = expenses
    .filter(e => e.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const pendingCount = expenses.filter(e => e.status === 'Pending').length

  // Budget progress
  const budgetPercentage = Math.min(100, Math.round((totalExpenses / budgetLimit) * 100))
  const budgetOverspent = totalExpenses > budgetLimit

  // Category breakdown data
  const categoryDataMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(categoryDataMap).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#8F5E54'
  })).sort((a, b) => b.value - a.value)

  // Top spending category
  const topCategory = pieChartData[0]?.name || 'N/A'
  const topCategoryAmount = pieChartData[0]?.value || 0

  // Date trend data (Grouped by date, sorted)
  const dateDataMap = expenses.reduce((acc, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const areaChartData = Object.entries(dateDataMap)
    .map(([date, amount]) => ({
      date,
      amount,
      formattedDate: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Filtered expenses listing
  const filteredExpenses = expenses
    .filter(e => {
      const matchesSearch = 
        e.description.toLowerCase().includes(search.toLowerCase()) || 
        e.merchant.toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter
      const matchesPayment = paymentFilter === 'All' || e.paymentMethod === paymentFilter

      return matchesSearch && matchesCategory && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const t1 = new Date(a.date).getTime()
        const t2 = new Date(b.date).getTime()
        return sortOrder === 'asc' ? t1 - t2 : t2 - t1
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }
    })

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Print Report Handler
  const handlePrint = () => {
    window.print()
  }

  // Export CSV
  const handleCSVExport = () => {
    const headers = ['ID', 'Date', 'Description', 'Merchant', 'Category', 'Payment Method', 'Amount', 'Status']
    const rows = expenses.map(e => [
      e.id,
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.category,
      e.paymentMethod,
      e.amount,
      e.status
    ])

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `nexzen_expenses_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('CSV report downloaded successfully', 'success')
  }

  return (
    <div className="flex flex-col gap-6 p-1 max-w-[1600px] mx-auto min-h-screen pb-16 print:p-0">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Expense Tracker & Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Monitor cash outflows, approve departmental spends, and view real-time expense dynamics.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={16} />
            <span>Print Report</span>
          </Button>
          <Button variant="outline" onClick={handleCSVExport} className="flex items-center gap-2">
            <Download size={16} />
            <span>Export CSV</span>
          </Button>
          <Button onClick={handleOpenAdd} className="flex items-center gap-2" style={{ background: 'var(--primary)', color: '#fff' }}>
            <Plus size={16} />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">NEXZEN — Loan Management System</h1>
            <h2 className="text-xl font-semibold text-slate-700 mt-1">Official Corporate Expense & Outflow Report</h2>
            <p className="text-sm text-slate-500 mt-1">Report Generated on: {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#43766C]">₹{totalExpenses.toLocaleString()}</div>
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider">Total Aggregated Expense</div>
          </div>
        </div>
      </div>

      {/* Top statistics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 print:grid-cols-4 print:gap-4">
        
        {/* Total Expense Card */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-slate-100/10">
            <Receipt size={70} className="text-[var(--primary)]/10" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Expenses</p>
          <p className="text-3xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{fmt(totalExpenses)}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(approvedExpenses)}</span> approved
          </div>
        </div>

        {/* Budget Limit Card */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Monthly Budget Limit</p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 print:hidden">
              <span>Limit:</span>
              <input
                type="number"
                value={budgetLimit}
                onChange={handleBudgetChange}
                className="w-16 h-6 px-1.5 border border-slate-200 dark:border-slate-700 text-center rounded outline-none"
                style={{ fontSize: 11, background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{budgetPercentage}%</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>of {fmt(budgetLimit)} limit</p>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-3.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${budgetOverspent ? 'bg-red-500' : 'bg-[var(--primary)]'}`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Pending Approvals</p>
          <p className="text-3xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{pendingCount}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{fmt(pendingExpenses)}</span> awaiting review
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Top Spending Category</p>
          <p className="text-xl font-bold mt-2.5 truncate" style={{ color: 'var(--text-primary)' }}>{topCategory}</p>
          <div className="flex items-center gap-1.5 mt-4.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--primary)' }}>{fmt(topCategoryAmount)}</span> spending weight
          </div>
        </div>

      </div>

      {/* Budget Overlimit Warn Banner */}
      {budgetOverspent && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-300 text-sm print:hidden">
          <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400 animate-pulse" />
          <div>
            <span className="font-bold">Overbudget Alert:</span> Total aggregated expense volume (<strong>{fmt(totalExpenses)}</strong>) has exceeded your designated operational ceiling threshold limit of <strong>{fmt(budgetLimit)}</strong>. Consider deferring pending expense approvals.
          </div>
        </div>
      )}

      {/* Analytics & Graph Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 print:grid-cols-2">
        
        {/* Trend Area Chart (3/5 width) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Outflow Spending Dynamics</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Historical timeline analysis of disbursements</p>
            </div>
            <TrendingUp size={18} className="text-[var(--primary)]" />
          </div>

          <div className="w-full h-[280px]">
            {areaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(67, 118, 108, 0.08)" vertical={false} />
                  <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [fmt(Number(value)), 'Outflow']}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No database records available for timeline plotting
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown (2/5 width) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Expenses by Category</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Allocation distribution structure</p>
            </div>
            <PieIcon size={18} className="text-[var(--primary)]" />
          </div>

          <div className="w-full h-[180px] relative">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [fmt(Number(value)), 'Allocation']}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No categorical distributions
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Outflow</span>
              <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{fmt(totalExpenses)}</span>
            </div>
          </div>

          {/* Custom legend grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 max-h-[100px] overflow-y-auto pr-1">
            {pieChartData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round((c.value / totalExpenses) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main interactive table view */}
      <div className="glass-card rounded-2xl p-0 border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none print:p-0">
        
        {/* Table Filters panel */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col gap-4 print:hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Expense Disbursement Registry</h2>
            <div className="relative max-w-sm w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search descriptions, merchants..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 h-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 outline-none outline-offset-0 focus:border-slate-400 transition-colors"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Filtering Dropdowns row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter size={12} />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <option value="All">All Payment Methods</option>
              {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Reset Filters button */}
            {(categoryFilter !== 'All' || statusFilter !== 'All' || paymentFilter !== 'All' || search) && (
              <button 
                onClick={() => {
                  setCategoryFilter('All')
                  setStatusFilter('All')
                  setPaymentFilter('All')
                  setSearch('')
                }}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 cursor-pointer hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Expenses List Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ marginBottom: 0 }}>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-1 hover:text-slate-600 cursor-pointer focus:outline-none print:pointer-events-none"
                  >
                    <span>Date</span>
                    {sortField === 'date' && (
                      <span className="text-[10px]">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">Description</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">Merchant</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">Category</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">Payment</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => toggleSort('amount')}
                    className="flex items-center gap-1 hover:text-slate-600 cursor-pointer focus:outline-none print:pointer-events-none"
                  >
                    <span>Amount</span>
                    {sortField === 'amount' && (
                      <span className="text-[10px]">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(exp => (
                  <tr 
                    key={exp.id} 
                    className="border-b border-slate-200 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {exp.description}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {exp.merchant}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLORS[exp.category] || '#ccc' }} />
                        <span style={{ color: 'var(--text-primary)' }}>{exp.category}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={12} className="text-slate-400" />
                        <span>{exp.paymentMethod}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      {fmt(exp.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span 
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                        style={
                          exp.status === 'Approved'
                            ? { background: 'rgba(59,122,87,0.12)', color: '#3B7A57', border: '1px solid rgba(59,122,87,0.2)' }
                            : exp.status === 'Pending'
                            ? { background: 'rgba(212,140,70,0.12)', color: '#B45309', border: '1px solid rgba(212,140,70,0.2)' }
                            : { background: 'rgba(184,58,58,0.12)', color: '#B83A3A', border: '1px solid rgba(184,58,58,0.2)' }
                        }
                      >
                        {exp.status === 'Approved' && <CheckCircle2 size={10} />}
                        {exp.status === 'Pending' && <Clock size={10} />}
                        {exp.status === 'Rejected' && <XCircle size={10} />}
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 print:hidden">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 cursor-pointer"
                        title="Edit entry"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                    No expense records found matching current query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Expense Record Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              required
            />
            <Input
              label="Amount (INR) *"
              type="number"
              placeholder="e.g. 5000"
              value={formAmount}
              onChange={e => setFormAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-slate-400 cursor-pointer"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Payment Method *</label>
              <select
                value={formPaymentMethod}
                onChange={e => setFormPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-slate-400 cursor-pointer"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <Input
            label="Merchant / Payee Name *"
            placeholder="e.g. Amazon Web Services"
            value={formMerchant}
            onChange={e => setFormMerchant(e.target.value)}
            required
          />

          <Input
            label="Description *"
            placeholder="e.g. Server hosting charges for development environment"
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Authorization Status</label>
            <div className="flex gap-4">
              {STATUSES.map(s => (
                <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formStatus === s}
                    onChange={() => setFormStatus(s as any)}
                    className="cursor-pointer"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ background: 'var(--primary)', color: '#fff' }}>
              {editingExpense ? 'Save Changes' : 'Record Outflow'}
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  )
}
