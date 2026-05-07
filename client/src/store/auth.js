import { create } from 'zustand'
import { login, register, getMe } from '../services/auth'

const persisted = JSON.parse(localStorage.getItem('auth') || 'null')

export const useAuthStore = create((set, get) => ({
  user: persisted?.user || null,
  token: persisted?.token || null,
  checkAuth: async () => {
    if (!get().token) return
    try {
      const user = await getMe()
      get().setAuth(user, get().token)
    } catch (err) {
      console.error("Auth check failed", err)
      get().logout()
    }
  },
  setAuth: (user, token) => {
    localStorage.setItem('auth', JSON.stringify({ user, token }))
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('auth')
    set({ user: null, token: null })
  },
  login: async (email, password) => {
    const res = await login({ email, password })
    get().setAuth(res.user, res.token)
  },
  register: async (data) => {
    const res = await register(data)
    return res
  }
}))
