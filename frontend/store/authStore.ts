import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/lib/api'

const FRONTEND_ONLY_MODE = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'

const demoUsers: Record<string, AuthUser> = {
  'admin@loanmanagement.com': {
    id: 1,
    name: 'Admin User',
    email: 'admin@loanmanagement.com',
    role: 'Admin',
    branchId: 1,
  },
  'employee@loanmanagement.com': {
    id: 2,
    name: 'Employee User',
    email: 'employee@loanmanagement.com',
    role: 'Employee',
    branchId: 1,
  },
  'user@loanmanagement.com': {
    id: 3,
    name: 'Demo User',
    email: 'user@loanmanagement.com',
    role: 'User',
    branchId: 1,
  },
}

interface AuthUser { 
  id: number
  name: string
  email: string
  role: string
  branchId?: number
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: async (email, password) => {
        if (FRONTEND_ONLY_MODE) {
          const normalizedEmail = email.trim().toLowerCase()
          const user = demoUsers[normalizedEmail]

          if (!user || password !== 'admin123') {
            return false
          }

          set({
            user,
            token: 'frontend-only-demo-token',
            isAuthenticated: true,
          })
          return true
        }

        try {
          const response = await apiClient.post<{
            success: boolean
            data: {
              user: AuthUser
              accessToken: string
              refreshToken: string
            }
          }>(API_ENDPOINTS.LOGIN, { email, password })

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Login failed:', error)
          return false
        }
      },
      logout: () => {
        if (FRONTEND_ONLY_MODE) {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
          return
        }

        const token = get().token
        if (token) {
          apiClient.post(API_ENDPOINTS.LOGOUT, {}, token).catch(console.error)
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'nexzen-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
