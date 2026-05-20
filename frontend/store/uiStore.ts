import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

interface UIStore {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
  notifications: NotificationItem[]
  addNotification: (title: string, message: string) => void
  markOneRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      toasts: [],
      showToast: (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random()}`
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
        setTimeout(() => get().removeToast(id), 4000)
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

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
    { name: 'nexzen-ui', partialize: s => ({ notifications: s.notifications }) }
  )
)
