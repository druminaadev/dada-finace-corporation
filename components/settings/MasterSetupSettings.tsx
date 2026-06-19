'use client'
import { useRouter } from 'next/navigation'
import { MapPin, Building2, Landmark, Tag, ChevronRight } from 'lucide-react'

const masterItems = [
  { label: 'States', path: '/master/states', icon: MapPin, description: 'Manage states', color: 'var(--primary)' },
  { label: 'Cities', path: '/master/cities', icon: Building2, description: 'Manage cities', color: 'var(--primary-light)' },
  { label: 'Areas', path: '/master/areas', icon: MapPin, description: 'Manage areas', color: 'var(--secondary)' },
  { label: 'Branches', path: '/master/branches', icon: Landmark, description: 'Manage branches', color: 'var(--primary)' },
  { label: 'Loan Types', path: '/master/loan-types', icon: Tag, description: 'Manage loan types', color: 'var(--primary-light)' },
  { label: 'Banks', path: '/master/banks', icon: Landmark, description: 'Manage banks', color: 'var(--secondary)' },
]

export default function MasterSetupSettings() {
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #e2e8f0' }}>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e293b' }}>Master Setup</h2>
        <p className="text-sm text-slate-500">Configure system master data and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {masterItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex items-center gap-4 p-5 rounded-xl border transition-all group text-left"
              style={{ borderColor: '#e2e8f0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color
                e.currentTarget.style.background = `${item.color}08`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: `${item.color}15` }}
              >
                <Icon size={20} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#1e293b' }}>{item.label}</div>
                <div className="text-xs text-slate-500">{item.description}</div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
