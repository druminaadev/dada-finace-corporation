'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Footer } from '@/components/layout/Footer'
import { Chatbot } from '@/components/ui/Chatbot'
import { migrateStripPhotos } from '@/lib/storageUtils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    migrateStripPhotos()
  }, [])

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'var(--surface)' }}
      />
    )
  }

  return (
    <>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev: boolean) => !prev)}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onMenuToggle={() => setSidebarOpen((prev: boolean) => !prev)} />

          <main className="flex-1 overflow-y-auto px-6 py-6 focus:outline-none">
            {children}
          </main>

          <Footer />
        </div>
      </div>

      <Chatbot />
    </>
  )
}
