import { create } from 'zustand'
import { getOrders, getOrderById } from '../services/orders'

export const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,
    currentOrder: null, // Add currentOrder state

    fetchOrders: async () => {
        set({ loading: true, error: null })
        try {
            const data = await getOrders()
            // Fix: ensure orders is always an array
            set({ orders: Array.isArray(data) ? data : [], loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    fetchOrder: async (id) => {
        set({ loading: true, error: null })
        try {
            const data = await getOrderById(id)
            set({ currentOrder: data, loading: false })
            return data
        } catch (err) {
            set({ error: err.message, loading: false })
            return null
        }
    },

    getOrder: (id) => get().orders.find(o => o._id === id || o.id === id)
}))
