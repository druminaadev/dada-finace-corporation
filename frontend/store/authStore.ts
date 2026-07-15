import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/lib/api'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  branchId?: string | null
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
        const token = get().token
        if (token) {
          apiClient.post(API_ENDPOINTS.LOGOUT, {}, token).catch(console.error)
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'dada-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
