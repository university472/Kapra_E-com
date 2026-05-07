import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../api'
import { nanoid } from 'nanoid'

// Ensure a session ID exists for guest cart/orders
const ensureSessionId = () => {
  let id = localStorage.getItem('sessionId')
  if (!id) {
    id = `sess_${nanoid(16)}`
    localStorage.setItem('sessionId', id)
  }
  return id
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      sessionId: ensureSessionId(),

      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, accessToken })
      },

      logout: async () => {
        try {
          await authAPI.logout()
        } catch (err){
          console.error('the error is:', err)
        }
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null })
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      isAuthenticated: () => !!get().user && !!get().accessToken,
      isAdmin: () => get().user?.role === 'admin'
    }),
    {
      name: 'kapra-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken
      })
    }
  )
)
