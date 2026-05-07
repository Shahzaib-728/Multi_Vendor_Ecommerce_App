import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api' // Ensure we have api access

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      userId: null, // Track currently logged in user to know when to sync/switch

      // Sync local cart with server on login
      syncWithServer: async (userId) => {
        const localItems = get().items
        set({ userId })

        try {
          // If we have local items, merge them first
          if (localItems.length > 0) {
            const { data } = await api.post('/cart/merge', { items: localItems })
            // Transform server items to match frontend structure if needed
            // Server returns items: [{ product: {...}, quantity: 1 }]
            // Frontend expects items: [{ id: '...', name: '...', ...product, qty: 1 }]
            const formatted = data.items.map(i => ({
              ...i.product,
              id: i.product._id || i.product.id,
              qty: i.quantity
            }))
            set({ items: formatted })
          } else {
            // Just fetch server cart
            const { data } = await api.get('/cart')
            const formatted = data.items.map(i => ({
              ...i.product,
              id: i.product._id || i.product.id,
              qty: i.quantity
            }))
            set({ items: formatted })
          }
        } catch (err) {
          console.error("Cart sync failed", err)
        }
      },

      clearLocal: () => set({ items: [], userId: null }),

      add: async (product) => {
        const { userId, items } = get()
        // If logged in, update server
        if (userId) {
          try {
            // Optimistic Update
            const existing = items.find(i => i.id === product.id)
            const newQty = existing ? (existing.qty || 1) + (product.qty || 1) : (product.qty || 1)

            await api.post('/cart/item', { productId: product.id, quantity: newQty })
            // Re-fetch or just apply optimistic? Re-fetching is safer for price updates but slower.
            // Let's optimistic update similar to local logic
            set((state) => {
              const ex = state.items.find(i => i.id === product.id)
              if (ex) {
                return { items: state.items.map(i => i.id === product.id ? { ...i, qty: newQty } : i) }
              }
              return { items: [...state.items, { ...product, qty: newQty }] }
            })
          } catch (err) { console.error(err) }
        } else {
          // Local logic
          set((state) => {
            const existing = state.items.find(i => i.id === product.id)
            if (existing) {
              return {
                items: state.items.map(i =>
                  i.id === product.id ? { ...i, qty: (i.qty || 1) + (product.qty || 1) } : i
                )
              }
            }
            return { items: [...state.items, { ...product, qty: product.qty || 1 }] }
          })
        }
      },

      remove: async (id) => {
        const { userId } = get()
        if (userId) {
          await api.post('/cart/item', { productId: id, quantity: 0 })
        }
        set((state) => ({ items: state.items.filter(i => i.id !== id) }))
      },

      increment: async (id) => {
        const { userId, items } = get()
        const item = items.find(i => i.id === id)
        if (!item) return

        const newQty = (item.qty || 1) + 1
        if (userId) await api.post('/cart/item', { productId: id, quantity: newQty })

        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, qty: newQty } : i)
        }))
      },

      decrement: async (id) => {
        const { userId, items } = get()
        const item = items.find(i => i.id === id)
        if (!item) return

        const newQty = Math.max(1, (item.qty || 1) - 1)
        if (userId) await api.post('/cart/item', { productId: id, quantity: newQty })

        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, qty: newQty } : i)
        }))
      },

      clear: async () => {
        const { userId } = get()
        if (userId) await api.delete('/cart')
        set({ items: [] })
      },
      count: () => get().items.reduce((a, b) => a + (b.qty || 1), 0)
    }),
    {
      name: 'cart-storage',
    }
  )
)
