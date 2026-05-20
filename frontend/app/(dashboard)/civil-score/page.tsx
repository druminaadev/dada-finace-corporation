'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'

function getLabel(score: number) {
  if (score >= 800) return { label: 'Excellent', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' }
  if (score >= 600) return { label: 'Good', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' }
  if (score >= 400) return { label: 'Average', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' }
  return { label: 'Risky', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' }
}

export default function CivilScorePage() {
  const { customers, civilScores, loans, emis } = useStore()

  const data = useMemo(() => customers.map(c => {
    const scoreData = civilScores[c.id] ?? { score: 700, history: [] }
    const { label, color } = getLabel(scoreData.score)
    const customerLoans = loans.filter(l => l.customerId === c.id)
    const loanIds = customerLoans.map(l => l.id)
    const overdueCount = emis.filter(e => loanIds.includes(e.loanId) && e.status === 'overdue').length
    return { customer: c, score: scoreData.score, label, color, history: scoreData.history, overdueCount }
  }), [customers, civilScores, loans, emis])

  return (
    <>
      <PageHeader title="Civil Score" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Excellent (800+)', count: data.filter(d => d.score >= 800).length, color: 'text-green-600 dark:text-green-400' },
            { label: 'Good (600-799)', count: data.filter(d => d.score >= 600 && d.score < 800).length, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Average (400-599)', count: data.filter(d => d.score >= 400 && d.score < 600).length, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Risky (<400)', count: data.filter(d => d.score < 400).length, color: 'text-red-600 dark:text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Customer', 'Mobile', 'Score', 'Rating', 'Overdue EMIs', 'Score History'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sort((a, b) => b.score - a.score).map((d, i) => (
                  <tr key={d.customer.id} className={`border-b border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{d.customer.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.customer.mobile}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(d.score / 900) * 100}%`, background: d.score >= 800 ? '#10B981' : d.score >= 600 ? '#3B82F6' : d.score >= 400 ? '#831C91' : '#EF4444' }} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.color}`}>{d.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.overdueCount > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                        {d.overdueCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 max-h-16 overflow-y-auto">
                        {d.history.length === 0 ? (
                          <span className="text-xs text-slate-400">No events yet</span>
                        ) : d.history.slice(-3).reverse().map((h, j) => (
                          <div key={j} className="text-xs flex gap-1">
                            <span className={h.change > 0 ? 'text-green-500' : 'text-red-500'}>{h.change > 0 ? '+' : ''}{h.change}</span>
                            <span className="text-slate-500 dark:text-slate-400 truncate">{h.reason}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
