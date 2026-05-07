import { create } from 'zustand'

export const useUIStore = create((set) => ({
  toasts: [],
  isLoginPopupOpen: false,
  pushToast: (toast) => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  openLoginPopup: () => set({ isLoginPopupOpen: true }),
  closeLoginPopup: () => set({ isLoginPopupOpen: false })
}))
