import { create } from 'zustand'
import { addProduct, getSellerProducts, deleteProduct, updateProduct } from '../services/seller'
import { getAllProducts, getProductById } from '../services/products'

export const useProductStore = create((set, get) => ({
    products: [],
    loading: false,
    error: null,

    fetchProducts: async () => {
        set({ loading: true })
        try {
            const data = await getAllProducts()
            set({ products: data, loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    fetchSellerProducts: async () => {
        set({ loading: true })
        try {
            const data = await getSellerProducts()
            set({ products: data, loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    addProduct: async (productData) => {
        set({ loading: true })
        try {
            const newProduct = await addProduct(productData)
            set((state) => ({
                products: [newProduct, ...state.products],
                loading: false
            }))
            return newProduct
        } catch (err) {
            set({ error: err.message, loading: false })
            throw err
        }
    },

    updateProduct: async (id, updates) => {
        set({ loading: true })
        try {
            const updated = await updateProduct(id, updates)
            set((state) => ({
                products: state.products.map(p => p._id === id || p.id === id ? updated : p),
                loading: false
            }))
            return updated
        } catch (err) {
            set({ error: err.message, loading: false })
            throw err
        }
    },

    deleteProduct: async (id) => {
        set({ loading: true })
        try {
            await deleteProduct(id)
            set((state) => ({
                products: state.products.filter(p => p._id !== id && p.id !== id),
                loading: false
            }))
        } catch (err) {
            set({ error: err.message, loading: false })
            throw err
        }
    },

    getProduct: (id) => get().products.find(p => p._id === id || p.id === id)
}))
