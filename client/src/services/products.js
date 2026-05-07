import api from './api'

export async function getAllProducts() {
  const res = await api.get('/products')
  return res.data
}

export async function getProductById(id) {
  const res = await api.get(`/products/${id}`)
  return res.data
}
