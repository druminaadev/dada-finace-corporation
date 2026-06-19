'use client'
import { useState } from 'react'
import { User, Shield, Bell, Settings as SettingsIcon } from 'lucide-react'
import ProfileSettings from '@/components/settings/ProfileSettings'
import SecuritySettings from '@/components/settings/SecuritySettings'
import NotificationSettings from '@/components/settings/NotificationSettings'
import MasterSetupSettings from '@/components/settings/MasterSetupSettings'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Manage your alerts' },
  { id: 'master', label: 'Master Setup', icon: SettingsIcon, description: 'System configuration' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />
      case 'security': return <SecuritySettings />
      case 'notifications': return <NotificationSettings />
      case 'master': return <MasterSetupSettings />
      default: return <ProfileSettings />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e293b' }}>Settings</h1>
        <p className="text-sm text-slate-500">Manage your account preferences and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all whitespace-nowrap"
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'white',
                color: isActive ? 'white' : '#64748b',
                border: isActive ? 'none' : '1px solid #e2e8f0',
                boxShadow: isActive ? '0 4px 12px rgba(70, 44, 125, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }
              }}
            >
              <Icon size={18} />
              <div className="text-left">
                <div className="text-sm font-semibold">{tab.label}</div>
                <div 
                  className="text-xs mt-0.5" 
                  style={{ color: isActive ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}
                >
                  {tab.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {renderContent()}
      </div>
    </div>
  )
}
