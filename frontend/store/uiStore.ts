import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

interface UIStore {
  notifications: NotificationItem[]
  addNotification: (title: string, message: string) => void
  markOneRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      notifications: [
        { id: '1', title: 'Loan Approved', message: 'LN161 has been approved successfully.', time: '2m ago', read: false },
        { id: '2', title: 'New Customer Added', message: 'Ramesh Patel has been registered.', time: '1h ago', read: false },
        { id: '3', title: 'Loan Disbursed', message: 'LN160 disbursed to customer.', time: '3h ago', read: true },
        { id: '4', title: 'EMI Due Reminder', message: 'LN162 EMI is due tomorrow.', time: '5h ago', read: true },
      ],
      addNotification: (title, message) =>
        set(s => ({
          notifications: [
            { id: `${Date.now()}`, title, message, time: 'just now', read: false },
            ...s.notifications,
          ],
        })),
      markOneRead: (id) =>
        set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () =>
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      clearAll: () => set({ notifications: [] }),
    }),
    { name: 'dada-ui', partialize: s => ({ notifications: s.notifications }) }
  )
)
